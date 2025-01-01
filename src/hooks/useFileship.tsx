import { useAtom } from "jotai";
import { nodeIdsBeingUpdatedAtom, selectedNodesAtom } from "../atoms";
import { useSearchParams } from "react-router";
import { useCallback, useMemo } from "react";

const useFileship = () => {
  const [selectedNodes, setSelectedNodes] = useAtom(selectedNodesAtom);
  const [nodeIdsBeingUpdated, setNodeIdsBeingUpdated] = useAtom(
    nodeIdsBeingUpdatedAtom,
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const parentId = useMemo(() => {
    return searchParams.get("parentId");
  }, [searchParams]);

  const setParentId = useCallback(
    (parentId: string | null) => {
      if (!parentId) {
        setSearchParams({});
        return;
      }
      const urlSearchParams = new URLSearchParams({
        parentId: parentId,
      });
      setSearchParams(urlSearchParams);
    },
    [setSearchParams],
  );

  return {
    parentId,
    selectedNodes,
    nodeIdsBeingUpdated,
    setParentId,
    setSelectedNodes,
    setNodeIdsBeingUpdated,
  };
};

export default useFileship;
