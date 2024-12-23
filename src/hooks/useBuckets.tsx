import { useCallback, useEffect, useState } from "react";
import { TBucket } from "../types";
import { fileshipFetch } from "../api";

const useBuckets = () => {
  const [buckets, setBuckets] = useState<TBucket[]>([]);

  const refreshBuckets = useCallback(async () => {
    fileshipFetch("/buckets/")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch buckets");
        }
        const { result } = await response.json();
        setBuckets(result);
      })
      .catch(() => {
        setBuckets([]);
      });
  }, []);

  const createBucket = useCallback(
    async (name: string) => {
      fileshipFetch("/buckets/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error("Failed to create bucket");
          }
          refreshBuckets();
        })
        .catch(() => {});
    },
    [refreshBuckets],
  );

  const deleteBucket = useCallback(
    async (bucketId: string) => {
      fileshipFetch(`/buckets/${bucketId}/`, {
        method: "DELETE",
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error("Failed to create bucket");
          }
          refreshBuckets();
        })
        .catch(() => {});
    },
    [refreshBuckets],
  );

  const shareBucket = useCallback(
    async (bucketId: string, email: string) => {
      fileshipFetch(`/buckets/${bucketId}/share/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error("Failed to create bucket");
          }
          refreshBuckets();
        })
        .catch(() => {});
    },
    [refreshBuckets],
  );

  const renameBucket = useCallback(
    async (bucketId: string, name: string) => {
      fileshipFetch(`/buckets/${bucketId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error("Failed to create bucket");
          }
          refreshBuckets();
        })
        .catch(() => {});
    },
    [refreshBuckets],
  );

  useEffect(() => {
    refreshBuckets();
  }, [refreshBuckets]);

  return {
    buckets,
    refreshBuckets,
    createBucket,
    deleteBucket,
    renameBucket,
    shareBucket,
  };
};

export default useBuckets;
