import { useEffect, useRef, useState } from "react";
import { IoDocumentText } from "react-icons/io5";
import { BiSolidFilePdf } from "react-icons/bi";
import { SiGoogleslides, SiGooglesheets } from "react-icons/si";
import { FaFile, FaFolder, FaCheckCircle } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { Debouncer, formatBytes, getAllFilesFromDrop } from "../utils";
import { CgSpinner } from "react-icons/cg";
import { FileshipRequestor } from "../api";
import useNavigation from "../hooks/useNavigation";
import useNodes from "../hooks/useNodes";
import useFileship from "../hooks/useFileship";
import Toolbar from "../components/Toolbar";
import { API_BASE_URL, CONNECTORS } from "../constants";
import { useParams } from "react-router";

const BucketPage = () => {
  const { bucketId } = useParams<{ bucketId: string }>();
  const [isHoveringOver, setIsHoveringOver] = useState(false);
  const { currentPathId, prevPathId, pathIdsString, navigate } =
    useNavigation();
  const {
    selectedNodes,
    editMode,
    modal,
    setNodeIdsBeingUpdated,
    nodeIdsBeingUpdated,
    setSelectedNodes,
  } = useFileship();
  const { nodes, pathname, cleanNodes } = useNodes(
    bucketId || "",
    currentPathId,
    !editMode,
  );
  const editModeDebouncerRef = useRef(new Debouncer({ delay: 500 }));

  useEffect(() => {
    cleanNodes();
    setSelectedNodes([]);
  }, [setSelectedNodes, cleanNodes, currentPathId]);

  if (!bucketId) return <></>;

  return (
    <div className="fixed inset-0 flex h-full w-full flex-col overflow-hidden bg-zinc-100">
      {modal}
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div
          className="relative flex h-full flex-col overflow-hidden"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.types.length === 0 || isHoveringOver) {
              return;
            }
            setIsHoveringOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsHoveringOver(false);
          }}
          onDrop={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsHoveringOver(false);

            const files = e.dataTransfer.files;
            if (!files || files.length === 0) return;

            const allFilesFromDrop = await getAllFilesFromDrop(
              e.dataTransfer.items,
              pathname,
            );

            const allPaths = allFilesFromDrop.map((file) => file.path);
            const allUniquePaths = [...new Set(allPaths)];
            const fullPathFolderIdMapping: Record<string, string | null> = {};

            for (const fullPath of allUniquePaths) {
              const folders = fullPath.split("/").filter(Boolean);
              let prevFolderId: string | null = null;
              for (const folderName of folders) {
                const folder = await FileshipRequestor.newFolder(
                  bucketId,
                  prevFolderId,
                  folderName,
                );
                prevFolderId = folder.id;
              }

              fullPathFolderIdMapping[fullPath] = prevFolderId;
            }

            [...allFilesFromDrop].forEach(async (fileFromDrop) => {
              const parentPathId = fullPathFolderIdMapping[fileFromDrop.path];
              const nodeId = await FileshipRequestor.uploadFile(
                bucketId,
                fileFromDrop.file,
                parentPathId,
              );
              setNodeIdsBeingUpdated((current) => {
                current.add(nodeId);
                return new Set(current);
              });
            });
          }}
        >
          {isHoveringOver && (
            <div className="pointer-events-none absolute inset-0 z-50 flex h-full w-full items-center justify-center bg-white/70 text-2xl text-zinc-400">
              <div className="flex flex-col items-center justify-center gap-2 backdrop-blur-lg">
                <div>Drop your files here...</div>
              </div>
            </div>
          )}
          <div className="h-full w-full overflow-auto">
            <table className="w-full">
              <thead className="relative z-50 shadow">
                <tr>
                  <th className="sticky top-0 h-9 w-4 border-r border-r-blue-300 bg-blue-500 px-6 text-left text-xs font-medium text-white">
                    <input
                      type="checkbox"
                      checked={selectedNodes.length > 0}
                      onChange={() => {
                        if (selectedNodes.length > 0)
                          return setSelectedNodes([]);

                        setSelectedNodes(nodes);
                      }}
                    />
                  </th>
                  <th className="sticky top-0 h-9 min-w-40 border-r border-r-blue-300 bg-blue-500 px-4 text-left text-xs font-medium text-white">
                    Name
                  </th>
                  <th className="sticky top-0 h-9 w-40 border-r border-r-blue-300 bg-blue-500 px-4 text-left text-xs font-medium text-white">
                    Size
                  </th>
                  <th className="sticky top-0 h-9 w-40 border-r border-r-blue-300 bg-blue-500 px-4 text-left text-xs font-medium text-white">
                    Created
                  </th>
                  <th className="sticky top-0 h-9 w-40 border-r border-r-blue-300 bg-blue-500 px-4 text-left text-xs font-medium text-white">
                    Updated
                  </th>
                  <th className="sticky top-0 h-9 w-40 border-r border-r-blue-300 bg-blue-500 px-4 text-left text-xs font-medium text-white">
                    Connectors
                  </th>
                  <th className="sticky top-0 h-9 w-40 border-r border-r-blue-300 bg-blue-500 px-4 text-left text-xs font-medium text-white">
                    Uploaded
                  </th>
                </tr>
              </thead>
              <tbody className="h-full w-full">
                {prevPathId !== undefined && (
                  <tr
                    className={`"bg-zinc-50" : "bg-zinc-100 text-xs text-nowrap transition-all hover:bg-blue-100/50`}
                  >
                    <td className="h-9"></td>
                    <td
                      className="h-9 w-full px-4"
                      onClick={async (e) => {
                        if (e.detail === 2) {
                          window.history.back();
                        }
                      }}
                    >
                      <div className="flex items-center gap-1 select-none">
                        <FaFolder className="text-yellow-500" />
                        <div>..</div>
                      </div>
                    </td>
                    <td className="h-9 w-40"></td>
                    <td className="h-9 w-40"></td>
                    <td className="h-9 w-40"></td>
                    <td className="h-9 w-40"></td>
                    <td className="h-9 w-40"></td>
                    <td className="h-9 w-40"></td>
                  </tr>
                )}
                {nodes.map((node, index) => {
                  const isSelected = selectedNodes
                    .map((_node) => _node.id)
                    .includes(node.id);

                  return (
                    <tr
                      key={`${currentPathId}-${node.id}`}
                      className={`text-xs text-nowrap transition-all select-none hover:bg-blue-100/50 ${isSelected ? "bg-blue-100" : index % 2 === 0 ? "bg-zinc-50" : "bg-zinc-100"}`}
                      onClick={async (e) => {
                        if (e.detail === 2) {
                          if (node.url) {
                            return window.open(
                              `${API_BASE_URL}/${node.url}`,
                              "_blank",
                            );
                          }
                          const newPath = `${pathIdsString}${node.id}/`;
                          navigate(newPath);

                          return;
                        }

                        setSelectedNodes([node]);
                      }}
                    >
                      <td
                        className="h-9 px-6 py-1"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (!e.target.checked) {
                              return setSelectedNodes(
                                selectedNodes.filter(
                                  (_node) => _node.id !== node.id,
                                ),
                              );
                            }
                            setSelectedNodes([...selectedNodes, node]);
                          }}
                        />
                      </td>
                      <td className="h-9 w-full px-4">
                        <div className="flex h-full items-center gap-1">
                          <div>
                            {node.children ? (
                              <FaFolder className="text-yellow-500" />
                            ) : ["docx", "doc"].includes(
                                node.name.split(".").slice(-1)[0]!,
                              ) ? (
                              <IoDocumentText className="text-blue-500" />
                            ) : ["xlsx", "xls"].includes(
                                node.name.split(".").slice(-1)[0]!,
                              ) ? (
                              <SiGooglesheets className="text-emerald-500" />
                            ) : ["pdf"].includes(
                                node.name.split(".").slice(-1)[0]!,
                              ) ? (
                              <BiSolidFilePdf className="text-rose-500" />
                            ) : ["ppt", "pptx"].includes(
                                node.name.split(".").slice(-1)[0]!,
                              ) ? (
                              <SiGoogleslides className="text-orange-400" />
                            ) : (
                              <FaFile className="text-zinc-300" />
                            )}
                          </div>
                          <div className="relative flex h-full w-full items-center">
                            <div
                              className={`w-full ${editMode ? "opacity-0" : "opacity-100"}`}
                            >
                              {node.name}
                            </div>
                            {editMode && (
                              <input
                                type="text"
                                className="absolute inset-0 h-full w-full shrink-0 bg-transparent outline-none"
                                defaultValue={node.name}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                onChange={(e) => {
                                  editModeDebouncerRef.current.exec(() => {
                                    FileshipRequestor.updateNode(
                                      bucketId,
                                      node.id,
                                      e.target.value,
                                      currentPathId,
                                    );
                                  });
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="h-9 px-4 py-1">
                        {formatBytes(node.size)}
                      </td>
                      <td className="h-9 px-4 py-1">
                        {new Date(node.createdAt).toLocaleString()}
                      </td>
                      <td className="h-9 px-4 py-1">
                        {new Date(node.updatedAt).toLocaleString()}
                      </td>
                      <td className="h-9 px-4 py-1">
                        {[
                          ...new Set(
                            node.chunks?.map((chunk) => {
                              return chunk.connector;
                            }),
                          ),
                        ].map((connector) => {
                          const connectorIcon = CONNECTORS.find(
                            (_connector) => _connector.key === connector,
                          )?.icon;

                          return (
                            <div key={`${node.id}-connector-${connector}`}>
                              {connectorIcon}
                            </div>
                          );
                        })}
                      </td>
                      <td className="h-9 px-4 py-1">
                        {node.chunks && (
                          <div className="flex items-center gap-2">
                            <div className="text-base">
                              {node.uploaded === 100 ? (
                                <FaCheckCircle className="text-emerald-500" />
                              ) : nodeIdsBeingUpdated.has(node.id) ? (
                                <CgSpinner className="animate-spin text-blue-500" />
                              ) : (
                                <ImCross className="text-rose-500" />
                              )}
                            </div>
                            <div>
                              {node.uploaded !== undefined &&
                                `${node.uploaded.toFixed(1)}%`}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex h-9 w-full items-center bg-zinc-800 p-1.5">
          <input
            type="text"
            className="h-full w-full shrink-0 rounded-full bg-transparent px-4 text-xs text-white"
            disabled
            value={pathname}
          />
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-8 flex items-center justify-center p-2">
        <div className="overflow-hidden rounded-full">
          <Toolbar />
        </div>
      </div>
    </div>
  );
};

export default BucketPage;
