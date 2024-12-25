import { useAtom } from "jotai";
import { nodeIdsBeingUpdatedAtom, selectedNodesAtom } from "../atoms";

const useFileship = () => {
  const [selectedNodes, setSelectedNodes] = useAtom(selectedNodesAtom);
  const [nodeIdsBeingUpdated, setNodeIdsBeingUpdated] = useAtom(
    nodeIdsBeingUpdatedAtom,
  );

  return {
    selectedNodes,
    nodeIdsBeingUpdated,
    setSelectedNodes,
    setNodeIdsBeingUpdated,
  };
};

export default useFileship;
