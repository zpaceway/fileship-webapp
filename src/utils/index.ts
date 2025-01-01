import { v4 as uuidv4 } from "uuid";

export class Debouncer {
  timeout?: number;
  delay: number;

  constructor({ delay }: { delay: number }) {
    this.delay = delay;
  }

  exec(callback: () => void) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(callback, this.delay);
  }
}

export const formatBytes = (bytes: number) => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
};

export const generateRandomUUID = () => {
  return uuidv4().replace(/-/g, "") + uuidv4().replace(/-/g, "");
};

export const chunkify = <T>(list: T[], chunkSize: number): T[][] => {
  if (chunkSize <= 0) {
    throw new Error("Chunk size must be greater than 0.");
  }

  const result: T[][] = [];
  for (let i = 0; i < list.length; i += chunkSize) {
    result.push(list.slice(i, i + chunkSize));
  }

  return result;
};

export const getAllFilesFromDrop = async (
  dataTransferItems: DataTransferItemList,
  currentPath: string,
) => {
  const entries = [];
  for (const item of dataTransferItems) {
    const entry = item.webkitGetAsEntry?.();
    if (entry) {
      entries.push(entry);
    }
  }

  const promises = entries.map((entry) => traverseFileTree(entry, currentPath));
  const results = await Promise.all(promises);

  return results.flat();
};

const traverseFileTree = (
  entry: FileSystemEntry,
  currentPath: string,
): Promise<{ file: File; path: string }[]> => {
  return new Promise((resolve, reject) => {
    if (entry.isFile) {
      (entry as FileSystemFileEntry).file(
        (fileObj) => {
          resolve([{ file: fileObj, path: currentPath }]);
        },
        (error) => reject(error),
      );
    } else if (entry.isDirectory) {
      const dirReader = (entry as FileSystemDirectoryEntry).createReader();
      dirReader.readEntries(
        async (entries) => {
          const subPromises = entries.map((e) =>
            traverseFileTree(e, `${currentPath}${entry.name}/`),
          );
          const subResults = await Promise.all(subPromises);
          resolve(subResults.flat());
        },
        (error) => reject(error),
      );
    } else {
      resolve([]);
    }
  });
};
