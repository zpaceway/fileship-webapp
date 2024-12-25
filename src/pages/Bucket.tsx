import { useEffect, useState } from "react";
import { IoDocumentText } from "react-icons/io5";
import { BiSolidFilePdf } from "react-icons/bi";
import { SiGoogleslides, SiGooglesheets } from "react-icons/si";
import { FaFile, FaFolder } from "react-icons/fa";
import { formatBytes, getAllFilesFromDrop } from "../utils";
import { FileshipRequestor } from "../api";
import useNavigation from "../hooks/useNavigation";
import useNodes from "../hooks/useNodes";
import useFileship from "../hooks/useFileship";
import Toolbar from "../components/Toolbar";
import { API_BASE_URL } from "../constants";
import { useParams } from "react-router";
import { twMerge } from "tailwind-merge";

const BucketPage = () => {
  const { bucketId } = useParams<{ bucketId: string }>();
  const [isHoveringOver, setIsHoveringOver] = useState(false);
  const { currentPathId, prevPathId, pathIdsString, navigate } =
    useNavigation();
  const {
    selectedNodes,
    setNodeIdsBeingUpdated,
    nodeIdsBeingUpdated,
    setSelectedNodes,
  } = useFileship();
  const { nodes, pathname, cleanNodes } = useNodes(
    bucketId || "",
    currentPathId,
  );

  useEffect(() => {
    cleanNodes();
    setSelectedNodes([]);
  }, [setSelectedNodes, cleanNodes, currentPathId]);

  if (!bucketId) return <></>;

  return (
    <div className="fixed inset-0 flex h-full w-full flex-col overflow-hidden bg-white">
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="flex h-12 w-full shrink-0 items-center border-b border-b-zinc-200 bg-blue-500">
          <input
            type="text"
            className="h-full w-full shrink-0 rounded-full bg-transparent px-4 text-sm text-white"
            disabled
            value={pathname}
          />
        </div>
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
              <tbody className="h-full w-full">
                {prevPathId !== undefined && (
                  <tr className="border-b border-b-zinc-200 bg-white text-xs text-nowrap text-zinc-900 transition-all hover:bg-blue-50">
                    <td className="h-12 w-10"></td>
                    <td
                      className="h-12"
                      onClick={async (e) => {
                        if (e.detail === 2) {
                          window.history.back();
                        }
                      }}
                    >
                      <div className="flex h-12 w-full shrink-0 grow-0 items-center gap-1 select-none">
                        <FaFolder className="text-yellow-500" />
                        <div>..</div>
                      </div>
                    </td>
                  </tr>
                )}
                {nodes.map((node, index) => {
                  const isSelected = selectedNodes
                    .map((_node) => _node.id)
                    .includes(node.id);

                  return (
                    <tr
                      key={`${currentPathId}-${node.id}`}
                      className={`h-12 border-b border-b-zinc-200 text-nowrap transition-all select-none hover:bg-blue-50 ${isSelected ? "bg-blue-50" : index % 2 === 0 ? "bg-blue-50/30" : "bg-white"}`}
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
                        className="flex h-12 w-10 items-center justify-center"
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

                      <td className="h-12 w-full pr-4">
                        <div className="flex h-full w-full items-center gap-1">
                          <div className="flex h-full w-full">
                            <div className="flex w-full items-center">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1 text-sm text-zinc-900">
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
                                  <div className="relative w-full">
                                    {node.name}
                                  </div>
                                </div>
                                <div className="flex items-center text-xs">
                                  <span className="text-zinc-400">
                                    {new Date(node.updatedAt).toLocaleString()}
                                  </span>
                                  <span className="inline-block w-2"></span>
                                  <span className="text-zinc-500">
                                    {formatBytes(node.size)}{" "}
                                  </span>
                                  {node.chunks && node.uploaded !== 100 && (
                                    <span>
                                      <span className="inline-block w-2"></span>
                                      <span
                                        className={twMerge(
                                          "rounded-full text-white",
                                          node.uploaded === 100
                                            ? "bg-emerald-500"
                                            : nodeIdsBeingUpdated.has(node.id)
                                              ? "text-blue-500"
                                              : "text-rose-400",
                                        )}
                                      >
                                        {node.uploaded.toFixed(1)}%
                                      </span>
                                    </span>
                                  )}
                                  <span className="inline-block w-2"></span>
                                  {[
                                    ...new Set(
                                      node.chunks?.map((chunk) => {
                                        return chunk.connector;
                                      }),
                                    ),
                                  ].map((connector) => {
                                    if (!connector) return null;

                                    return (
                                      <div
                                        className="mr-0.5 inline-block"
                                        key={`${node.id}-connector-${connector}`}
                                      >
                                        <div className="flex h-3.5 w-3.5 items-center justify-center bg-zinc-200 text-xs font-bold text-white">
                                          {connector[0].toUpperCase()}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-2 flex items-center justify-center p-2">
        <div className="overflow-hidden rounded-full">
          <Toolbar />
        </div>
      </div>
    </div>
  );
};

export default BucketPage;
