import { IoCheckboxSharp, IoSettings } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { HiLink } from "react-icons/hi";
import { FaPlus } from "react-icons/fa6";
import { TbReload } from "react-icons/tb";
import { MdEdit, MdCreateNewFolder, MdDelete } from "react-icons/md";
import ActionForm from "./ActionForm";
import SettingsForm from "./SettingsForm";
import { FileshipRequestor } from "../api";
import useSettings from "../hooks/useSettings";
import useFileship from "../hooks/useFileship";
import { useAtom } from "jotai";
import { toast } from "react-toastify";
import { nodesAtom } from "../atoms";
import { useParams } from "react-router";
import { API_BASE_URL } from "../constants";
import Button from "./Button";
import { twMerge } from "tailwind-merge";
import useModal from "../hooks/useModal";
import useAuth from "../hooks/useAuth";

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
  const { user } = useAuth();
  const { bucketId } = useParams<{ bucketId: string }>();
  const { connector, setConnector } = useSettings();
  const { setModal } = useModal();
  const {
    parentId,
    setParentId,
    selectedNodes,
    setSelectedNodes,
    setNodeIdsBeingUpdated,
  } = useFileship();
  const [nodes, setNodes] = useAtom(nodesAtom);

  if (!bucketId || !user) return <></>;

  return (
    <div className="flex shrink-0 border-r border-blue-300/50">
      <ToolbarButton
        onClick={async () => {
          if (!parentId) return;
          setNodes([]);
          setSelectedNodes([]);
          setParentId(null);
        }}
      >
        <FaHome />
      </ToolbarButton>
      <ToolbarButton
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
              parentId,
            );
            setNodeIdsBeingUpdated((current) => {
              current.add(nodeId);
              return new Set(current);
            });
          });
        }}
      />
      <ToolbarButton
        onClick={() => {
          document.querySelector<HTMLInputElement>("#file-uploader")?.click();
        }}
      >
        <FaPlus />
      </ToolbarButton>
      <ToolbarButton
        disabled={selectedNodes.length !== 1 || !selectedNodes[0]?.url}
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
        onClick={async () => {
          const newFolder = await FileshipRequestor.newFolder(
            bucketId,
            parentId,
          );
          setSelectedNodes([newFolder]);
        }}
      >
        <MdCreateNewFolder />
      </ToolbarButton>

      <ToolbarButton
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
        disabled={selectedNodes.length !== 1}
        onClick={() => {
          const newName = prompt(
            "Enter node's new name",
            selectedNodes[0].name,
          );
          if (!newName) return;

          FileshipRequestor.updateNode(
            bucketId,
            selectedNodes[0].id,
            newName,
            parentId,
          );
        }}
      >
        <MdEdit />
      </ToolbarButton>
      <ToolbarButton
        variant="error"
        disabled={selectedNodes.length === 0}
        onClick={() => {
          setModal(
            <ActionForm
              title="Delete"
              onAccept={() => {
                for (const selectedNode of selectedNodes) {
                  FileshipRequestor.deleteNode(bucketId, selectedNode.id);
                }
                setModal(null);
                setSelectedNodes([]);
              }}
              onCancel={() => {
                setModal(null);
              }}
            >
              Are you sure you want to delete {selectedNodes.length} files? This
              action can not be undone.
            </ActionForm>,
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
        onClick={() => {
          setModal(
            <SettingsForm
              initialValues={{ connector, apiKey: user.apiKey }}
              onAccept={({ connector }) => {
                setConnector(connector);
                setModal(null);
              }}
              onCancel={() => setModal(null)}
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
