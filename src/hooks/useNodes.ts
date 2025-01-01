import { useCallback, useEffect, useRef, useState } from "react";
import { FileshipRequestor } from "../api";
import { useAtom } from "jotai";
import { nodesAtom } from "../atoms";

const useNodes = (bucketId: string, parentId: string | null) => {
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [pathname, setPathname] = useState("/");
  const isFetchingNodesRef = useRef(false);
  const cleanNodes = useCallback(() => {
    setNodes([]);
  }, [setNodes]);

  useEffect(() => {
    let mounted = true;
    cleanNodes();

    const wrapped = async () => {
      if (!mounted) return;
      if (isFetchingNodesRef.current) return;
      isFetchingNodesRef.current = true;
      const result = mounted
        ? await FileshipRequestor.fetchNodes(bucketId, parentId)
        : null;
      isFetchingNodesRef.current = false;
      if (result && mounted) {
        setPathname(result.pathname);
        setNodes(result.children);
      }
      await new Promise((res) => setTimeout(res, 500));
      if (!mounted) return;
      await wrapped();
    };

    wrapped();

    return () => {
      mounted = false;
      isFetchingNodesRef.current = false;
    };
  }, [bucketId, parentId, cleanNodes, setNodes]);

  return { nodes, pathname, cleanNodes };
};

export default useNodes;
