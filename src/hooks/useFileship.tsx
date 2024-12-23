import { useAtom } from "jotai";
import {
  editModeAtom,
  modalAtom,
  nodeIdsBeingUpdatedAtom,
  selectedNodesAtom,
} from "../atoms";

const useFileship = () => {
  const [selectedNodes, setSelectedNodes] = useAtom(selectedNodesAtom);
  const [editMode, setEditMode] = useAtom(editModeAtom);
  const [modal, setModal] = useAtom(modalAtom);
  const [nodeIdsBeingUpdated, setNodeIdsBeingUpdated] = useAtom(
    nodeIdsBeingUpdatedAtom,
  );

  return {
    selectedNodes,
    editMode,
    modal,
    nodeIdsBeingUpdated,
    setSelectedNodes,
    setEditMode,
    setModal,
    setNodeIdsBeingUpdated,
  };
};

export default useFileship;
