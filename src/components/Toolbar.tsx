import { IoSettings } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { HiLink } from "react-icons/hi";
import { FaPlus } from "react-icons/fa6";
import { TbReload } from "react-icons/tb";
import { MdEdit, MdCreateNewFolder, MdDelete } from "react-icons/md";
import ActionModal from "./ActionModal";
import SettingsModal from "./SettingsModal";
import { FileshipRequestor } from "../api";
import useSettings from "../hooks/useSettings";
import useNavigation from "../hooks/useNavigation";
import useFileship from "../hooks/useFileship";
import { useAtom } from "jotai";
import { toast } from "react-toastify";
import { nodesAtom } from "../atoms";
import { useParams } from "react-router";
import { API_BASE_URL } from "../constants";
import Button from "./Button";
import { twMerge } from "tailwind-merge";

const Toolbar = () => {
  const { bucketId } = useParams<{ bucketId: string }>();
  const { connector, setConnector } = useSettings();
  const { currentPathId: currentPathId, navigate } = useNavigation();
  const {
    selectedNodes,
    editMode,
    setSelectedNodes,
    setNodeIdsBeingUpdated,
    setEditMode,
    setModal,
  } = useFileship();
  const [, setNodes] = useAtom(nodesAtom);

  if (!bucketId) return <></>;

  return (
    <div className="flex shrink-0 border-r border-blue-300/50 text-xl">
      <Button
        className="flex h-9 w-9 items-center justify-center border-r border-blue-300/50"
        onClick={async () => {
          if (!currentPathId) return;
          setNodes([]);
          setSelectedNodes([]);
          navigate("/");
        }}
      >
        <FaHome />
      </Button>
      <Button
        className="flex h-9 w-9 items-center justify-center border-r border-blue-300/50"
        onClick={() => {
          setNodes([]);
        }}
      >
        <TbReload />
      </Button>
      <input
        id="file-uploader"
        type="file"
        className="hidden"
        multiple
        onChange={(e) => {
          const files = e.target.files;
          if (!files || files.length === 0) return;

          [...files].forEach(async (file) => {
            const nodeId = await FileshipRequestor.uploadFile(
              bucketId,
              file,
              currentPathId,
            );
            setNodeIdsBeingUpdated((current) => {
              current.add(nodeId);
              return new Set(current);
            });
          });
        }}
      />
      <Button
        className="flex h-9 w-9 items-center justify-center border-r border-blue-300/50"
        onClick={() => {
          document.querySelector<HTMLInputElement>("#file-uploader")?.click();
        }}
      >
        <FaPlus />
      </Button>
      <Button
        className="flex h-9 w-9 items-center justify-center border-r border-blue-300/50"
        disabled={selectedNodes.length !== 1 || !selectedNodes[0]?.url}
        onClick={() => {
          navigator.clipboard.writeText(
            `${API_BASE_URL}/${selectedNodes[0]?.url}`,
          );
          toast.success("URL copied to clipboard!");
        }}
      >
        <HiLink />
      </Button>
      <Button
        className="flex h-9 w-9 items-center justify-center border-r border-blue-300/50"
        onClick={async () => {
          const newFolder = await FileshipRequestor.newFolder(
            bucketId,
            currentPathId,
          );
          setSelectedNodes([newFolder]);
        }}
      >
        <MdCreateNewFolder />
      </Button>

      <Button
        className={twMerge(
          "flex h-9 w-9 items-center justify-center border-r border-blue-300/50",
          editMode && "bg-blue-600",
        )}
        onClick={() => {
          setEditMode((state) => !state);
        }}
      >
        <MdEdit />
      </Button>
      <Button
        variant="error"
        className="flex h-9 w-9 items-center justify-center border-r border-blue-300/50"
        disabled={selectedNodes.length === 0}
        onClick={() => {
          setModal(
            <ActionModal
              title="Delete"
              body={`Are you sure you want to delete ${selectedNodes.length} files? This action can not be undone.`}
              onAccept={() => {
                for (const selectedNode of selectedNodes) {
                  FileshipRequestor.deleteNode(bucketId, selectedNode.id);
                }
                setModal(undefined);
                setSelectedNodes([]);
              }}
              onCancel={() => {
                setModal(undefined);
              }}
            />,
          );
        }}
      >
        <MdDelete />
        {selectedNodes.length > 0 && (
          <div className="absolute -top-0.25 right-0.5 flex aspect-square text-[9px] font-bold">
            {selectedNodes.length}
          </div>
        )}
      </Button>
      <Button
        className="flex h-9 w-9 items-center justify-center border-r border-blue-300/50"
        onClick={() => {
          setModal(
            <SettingsModal
              initialValues={{ connector }}
              onAccept={({ connector }) => {
                setConnector(connector);
                setModal(undefined);
              }}
              onCancel={() => setModal(undefined)}
            />,
          );
        }}
      >
        <IoSettings />
      </Button>
    </div>
  );
};

export default Toolbar;
