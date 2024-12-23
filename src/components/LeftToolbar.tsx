import { IoSettings } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { HiLink } from "react-icons/hi";
import { FaPlus } from "react-icons/fa6";
import { TbReload } from "react-icons/tb";
import { MdEdit, MdCreateNewFolder, MdDelete } from "react-icons/md";
import ActionModal from "../components/ActionModal";
import SettingsModal from "../components/SettingsModal";
import { FileshipRequestor } from "../api";
import useSettings from "../hooks/useSettings";
import useNavigation from "../hooks/useNavigation";
import useFileship from "../hooks/useFileship";
import { useAtom } from "jotai";
import { toast } from "react-toastify";
import { nodesAtom } from "../atoms";
import { useParams } from "react-router";
import { API_BASE_URL } from "../constants";

const LeftToolbar = () => {
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
    <div className="flex h-full shrink-0 flex-col border-r border-r-zinc-500 bg-zinc-700 text-xl">
      <button
        className="flex h-9 w-9 cursor-pointer items-center justify-center border-b border-b-zinc-500 bg-zinc-600 px-2 text-nowrap text-white transition-all hover:bg-zinc-500"
        onClick={async () => {
          if (!currentPathId) return;
          setNodes([]);
          setSelectedNodes([]);
          navigate("/");
        }}
      >
        <FaHome />
      </button>
      <button
        className="flex h-9 w-9 cursor-pointer items-center justify-center border-b border-b-zinc-500 bg-zinc-600 px-2 text-nowrap text-white transition-all hover:bg-zinc-500"
        onClick={() => {
          setNodes([]);
        }}
      >
        <TbReload />
      </button>
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
      <button
        className="flex h-9 w-9 cursor-pointer items-center justify-center border-b border-b-zinc-500 bg-zinc-600 px-2 text-nowrap text-white transition-all hover:bg-zinc-500"
        onClick={() => {
          document.querySelector<HTMLInputElement>("#file-uploader")?.click();
        }}
      >
        <FaPlus />
      </button>
      <button
        className={`flex h-9 w-9 cursor-pointer items-center justify-center border-b border-b-zinc-500 bg-zinc-600 px-2 text-nowrap text-white transition-all ${selectedNodes.length !== 1 || !selectedNodes[0]?.url ? "opacity-50" : "hover:bg-zinc-500"}`}
        disabled={selectedNodes.length !== 1 || !selectedNodes[0]?.url}
        onClick={() => {
          navigator.clipboard.writeText(
            `${API_BASE_URL}/${selectedNodes[0]?.url}`,
          );
          toast.success("URL copied to clipboard!");
        }}
      >
        <HiLink />
      </button>
      <button
        className="flex h-9 w-9 cursor-pointer items-center justify-center border-b border-b-zinc-500 bg-zinc-600 px-2 text-nowrap text-white transition-all hover:bg-zinc-500"
        onClick={async () => {
          const newFolder = await FileshipRequestor.newFolder(
            bucketId,
            currentPathId,
          );
          setSelectedNodes([newFolder]);
        }}
      >
        <MdCreateNewFolder />
      </button>

      <button
        className={`flex h-9 w-9 cursor-pointer items-center justify-center border-b border-b-zinc-500 px-2 text-nowrap text-white transition-all ${editMode ? "bg-zinc-800" : "bg-zinc-600 hover:bg-zinc-500"}`}
        onClick={() => {
          setEditMode((state) => !state);
        }}
      >
        <MdEdit />
      </button>
      <button
        disabled={selectedNodes.length === 0}
        className={`relative flex h-9 w-9 cursor-pointer items-center justify-center border-b border-b-zinc-500 bg-rose-500 px-2 text-nowrap text-white transition-all ${selectedNodes.length > 0 ? "hover:bg-rose-400" : "opacity-50"}`}
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
          <div className="absolute top-4 right-0.5 flex aspect-square text-[8px] font-bold">
            {selectedNodes.length}
          </div>
        )}
      </button>
      <button
        className="flex h-9 w-9 cursor-pointer items-center justify-center border-b border-b-zinc-500 bg-zinc-600 px-2 text-nowrap text-white transition-all hover:bg-zinc-500"
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
      </button>
    </div>
  );
};

export default LeftToolbar;
