import { API_BASE_URL } from "../constants";
import { Settings } from "../enums";
import { TConnector, TNode } from "../types";
import { generateRandomUUID } from "../utils";

const unprotectedRoutes = [
  "/users/token/refresh/",
  "/users/otp/validate/",
  "/users/otp/request/",
];

export const fileshipFetch = async (path: string, init?: RequestInit) => {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> =
    (init?.headers as Record<string, string>) || {};

  if (!unprotectedRoutes.includes(path)) {
    let accessToken = localStorage.getItem("accessToken");
    const lastAccessTokenAtStr = localStorage.getItem("lastAccessTokenAt");

    if (!accessToken || !lastAccessTokenAtStr) {
      throw new Error("No access token found");
    }

    const lastAccessTokenAt = new Date(lastAccessTokenAtStr);
    const fourMinutes = 1000 * 60 * 4;
    const now = new Date();

    if (now.getTime() - lastAccessTokenAt.getTime() > fourMinutes) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token found");
      }

      const response = await fetch(`${API_BASE_URL}/users/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      accessToken = (await response.json()).access;

      if (!accessToken) {
        throw new Error("No access token found");
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("lastAccessTokenAt", new Date().toISOString());
    }

    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return fetch(url, { ...(init || {}), headers });
};

type Callback = () => Promise<void>;

export class FileshipRequestor {
  static maxRequestsRunning = 4;
  static maxRetryCount = 8;
  static maxNodesCachePerPath = 8;
  static defaultRequestTimeoutInMilliseconds = 60000;

  static callbacksWaitingQueue: Callback[] = [];
  static callbacksRunningQueue: Callback[] = [];
  static nodesCache: Record<string, { pathname: string; children: TNode[] }> =
    {};

  static getConnector() {
    return localStorage.getItem(Settings.CONNECTOR) as TConnector;
  }

  static isCallbackRunning(callback: Callback) {
    return this.callbacksRunningQueue.includes(callback);
  }

  static isRunningQueueAvailable() {
    return this.callbacksRunningQueue.length < this.maxRequestsRunning;
  }

  static canStartCallback(callback: Callback) {
    return this.isRunningQueueAvailable() && !this.isCallbackRunning(callback);
  }

  static pushCallback(
    callback: Callback,
    options: { inmediate: boolean } = { inmediate: false },
  ) {
    let retryCount = 0;

    const wrappedCallback = async () => {
      if (!this.canStartCallback(wrappedCallback)) return;

      this.callbacksRunningQueue.push(wrappedCallback);
      this.callbacksWaitingQueue = this.callbacksWaitingQueue.filter(
        (_wrappedCallback) => _wrappedCallback !== wrappedCallback,
      );

      try {
        await callback();
      } catch {
        retryCount += 1;
        if (this.maxRequestsRunning >= retryCount) {
          if (options.inmediate) {
            this.callbacksWaitingQueue.unshift(wrappedCallback);
          } else {
            this.callbacksWaitingQueue.push(wrappedCallback);
          }
        }
      }

      this.callbacksRunningQueue = this.callbacksRunningQueue.filter(
        (_wrappedCallback) => _wrappedCallback !== wrappedCallback,
      );
      await this.callbacksWaitingQueue[0]?.();
    };

    if (options.inmediate) {
      this.callbacksWaitingQueue.unshift(wrappedCallback);
    } else {
      this.callbacksWaitingQueue.push(wrappedCallback);
    }
    wrappedCallback();
  }

  static async updateNode(
    bucketId: string,
    nodeId: string,
    name: string,
    folder: string | null,
  ) {
    await fileshipFetch(`/buckets/${bucketId}/nodes/${nodeId}/`, {
      method: "PATCH",
      body: JSON.stringify({
        name,
        folder,
      }),
      redirect: "follow",
      headers: {
        "content-type": "application/json",
      },
      signal: AbortSignal.timeout(this.defaultRequestTimeoutInMilliseconds),
    });
  }

  static async uploadFile(
    bucketId: string,
    file: File,
    folder: string | null,
  ): Promise<string> {
    const chunkSize = 1024 * 1024 * 20;

    const nodeId = generateRandomUUID();
    const formdata = new FormData();
    formdata.append("id", nodeId);
    formdata.append("name", file.name);
    formdata.append("size", file.size.toString());
    formdata.append("chunks", Math.ceil(file.size / chunkSize).toString());

    if (folder) formdata.append("parent", folder);

    return new Promise((res) => {
      this.pushCallback(
        async () => {
          const response = await fileshipFetch(`/buckets/${bucketId}/nodes/`, {
            method: "POST",
            body: formdata,
            redirect: "follow",
            signal: AbortSignal.timeout(
              this.defaultRequestTimeoutInMilliseconds,
            ),
          });

          const { result: node }: { result: TNode } = await response.json();
          const resultNodeId = node.id;
          res(resultNodeId);

          if (node.uploaded === 100) return;

          let start = 0;
          let end = chunkSize;
          let index = 0;
          let data = file.slice(start, end);
          while (data.size) {
            if (!node.chunks?.[index]?.connector) {
              const formdata = new FormData();
              formdata.append("file", data);
              formdata.append("connector", this.getConnector());

              const createChunkUrl = `/buckets/${bucketId}/nodes/${resultNodeId}/chunks/${index}/`;

              this.pushCallback(async () => {
                await fileshipFetch(createChunkUrl, {
                  method: "POST",
                  body: formdata,
                  redirect: "follow",
                  signal: AbortSignal.timeout(
                    this.defaultRequestTimeoutInMilliseconds,
                  ),
                });
              });
            }

            start += chunkSize;
            end += chunkSize;
            index += 1;
            data = file.slice(start, end);
          }
        },
        { inmediate: true },
      );
    });
  }

  static async newFolder(
    bucketId: string,
    parentPathId: string | null,
    name: string = "New Folder",
  ) {
    const formdata = new FormData();
    formdata.append("id", generateRandomUUID());
    formdata.append("name", name);
    formdata.append("chunks", "0");
    formdata.append("size", "0");
    if (parentPathId) formdata.append("parent", parentPathId);

    const response = await fileshipFetch(`/buckets/${bucketId}/nodes/`, {
      method: "POST",
      body: formdata,
      redirect: "follow",
      signal: AbortSignal.timeout(this.defaultRequestTimeoutInMilliseconds),
    });

    const { result: newFolder } = (await response.json()) as {
      result: TNode;
    };

    return newFolder;
  }

  static async deleteNode(bucketId: string, nodeId: string) {
    await fileshipFetch(`/buckets/${bucketId}/nodes/${nodeId}/`, {
      method: "DELETE",
      redirect: "follow",
    }).catch((error) => console.error(error));
  }

  static async fetchNodes(bucketId: string, currentPath: string | null) {
    const currentLastChunk = currentPath ? `${currentPath}/` : "";

    if (this.nodesCache[currentLastChunk]) {
      const cached = this.nodesCache[currentLastChunk];
      delete this.nodesCache[currentLastChunk];
      return cached;
    }

    const currentPathResult: {
      result: { pathname: string; children: TNode[] } | null;
    } = await fileshipFetch(`/buckets/${bucketId}/nodes/${currentLastChunk}`, {
      signal: AbortSignal.timeout(this.defaultRequestTimeoutInMilliseconds),
    })
      .then(async (res) =>
        res.status === 200 ? await res.json() : { result: null },
      )
      .catch(() => ({ result: null }));

    const { result: currentResult } = currentPathResult;

    if (currentResult) {
      this.nodesCache[currentLastChunk] = currentResult;
    }

    return currentResult;
  }
}
