import { IoCheckboxSharp, IoSettings } from "react-icons/io5";
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

type ToolbarButtonProps = Parameters<typeof Button>[0];

const ToolbarButton = ({
  className,
  children,
  ...rest
}: ToolbarButtonProps) => {
  return (
    <Button
      className={twMerge(
        "flex h-9 w-9 items-center justify-center border-r border-blue-300/50 text-xl",
        className,
      )}
      {...rest}
    >
      {children}
    </Button>
  );
};

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
  const [nodes, setNodes] = useAtom(nodesAtom);

  if (!bucketId) return <></>;

  return (
    <div className="flex shrink-0 border-r border-blue-300/50">
      <ToolbarButton
        disabled={editMode}
        onClick={async () => {
          if (!currentPathId) return;
          setNodes([]);
          setSelectedNodes([]);
          navigate("/");
        }}
      >
        <FaHome />
      </ToolbarButton>
      <ToolbarButton
        disabled={editMode}
        onClick={() => {
          setNodes([]);
        }}
      >
        <TbReload />
      </ToolbarButton>
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
      <ToolbarButton
        disabled={editMode}
        onClick={() => {
          document.querySelector<HTMLInputElement>("#file-uploader")?.click();
        }}
      >
        <FaPlus />
      </ToolbarButton>
      <ToolbarButton
        disabled={
          editMode || selectedNodes.length !== 1 || !selectedNodes[0]?.url
        }
        onClick={() => {
          navigator.clipboard.writeText(
            `${API_BASE_URL}/${selectedNodes[0]?.url}`,
          );
          toast.success("URL copied to clipboard!");
        }}
      >
        <HiLink />
      </ToolbarButton>
      <ToolbarButton
        disabled={editMode}
        onClick={async () => {
          const newFolder = await FileshipRequestor.newFolder(
            bucketId,
            currentPathId,
          );
          setSelectedNodes([newFolder]);
        }}
      >
        <MdCreateNewFolder />
      </ToolbarButton>

      <ToolbarButton
        disabled={editMode}
        className={
          selectedNodes.length > 0 ? "bg-blue-700 hover:bg-blue-700" : ""
        }
        onClick={() => {
          if (selectedNodes.length > 0) return setSelectedNodes([]);

          setSelectedNodes(nodes);
        }}
      >
        <IoCheckboxSharp />
      </ToolbarButton>
      <ToolbarButton
        className={editMode ? "bg-blue-600" : ""}
        onClick={() => {
          setEditMode((state) => !state);
        }}
      >
        <MdEdit />
      </ToolbarButton>
      <ToolbarButton
        variant="error"
        disabled={editMode || selectedNodes.length === 0}
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
          <div className="absolute right-0.5 bottom-0 flex text-[9px] font-bold">
            {selectedNodes.length}
          </div>
        )}
      </ToolbarButton>
      <ToolbarButton
        disabled={editMode}
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
      </ToolbarButton>
    </div>
  );
};

export default Toolbar;
