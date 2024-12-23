import { useCallback, useEffect, useRef, useState } from "react";
import { FileshipRequestor } from "../api";
import { useAtom } from "jotai";
import { nodesAtom } from "../atoms";

const useNodes = (
  bucketId: string,
  currentPath: string | null,
  watch: boolean,
) => {
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [pathname, setPathname] = useState("/");
  const isFetchingNodesRef = useRef(false);
  const cleanNodes = useCallback(() => {
    setNodes([]);
  }, [setNodes]);

  useEffect(() => {
    let mounted = true;

    const wrapped = async () => {
      if (!mounted) return;
      if (isFetchingNodesRef.current) return;
      isFetchingNodesRef.current = true;
      const result = mounted
        ? await FileshipRequestor.fetchNodes(bucketId, currentPath).catch(
            () => null,
          )
        : null;
      isFetchingNodesRef.current = false;
      if (result && mounted && watch) {
        setPathname(result.pathname);
        setNodes(result.children);
      }
      await new Promise((res) => setTimeout(res, 250));
      if (!mounted) return;
      await wrapped();
    };

    wrapped();

    return () => {
      mounted = false;
      isFetchingNodesRef.current = false;
    };
  }, [bucketId, currentPath, setNodes, watch]);

  return { nodes, pathname, cleanNodes };
};

export default useNodes;
