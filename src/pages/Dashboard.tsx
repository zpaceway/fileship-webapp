import { useState } from "react";
import useAuth from "../hooks/useAuth";
import useBuckets from "../hooks/useBuckets";
import Button from "../components/Button";
import { FaBucket, FaUser } from "react-icons/fa6";
import { FaPencilAlt } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { IoIosShareAlt } from "react-icons/io";
import { z } from "zod";
import { toast } from "react-toastify";
import useModal from "../hooks/useModal";
import ActionForm from "../components/ActionForm";

const shareBucketSchema = z.object({
  email: z.string().email(),
});

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const { setModal } = useModal();
  const { buckets, createBucket, deleteBucket, shareBucket, renameBucket } =
    useBuckets();
  const [userTooltipOpen, setUserTooltipOpen] = useState(false);

  if (!user) {
    return <></>;
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      <div className="flex h-12 w-full shrink-0 grow-0 items-center justify-between border-b border-b-zinc-200 bg-blue-500 px-4">
        <div></div>
        <div
          className="relative flex items-center gap-2"
          onClick={() => setUserTooltipOpen(!userTooltipOpen)}
        >
          <div className="flex cursor-pointer items-center gap-2">
            <div className="text-sm text-white">{user.email}</div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-400 font-medium text-white">
              {user.email[0].toUpperCase()}
            </div>
          </div>
          {userTooltipOpen && (
            <>
              <div className="fixed inset-0 z-40"></div>
              <div className="absolute top-[calc(100%_+_4px)] right-0 z-50 border border-zinc-200 text-sm">
                <button
                  className="cursor-pointer bg-white p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    signOut();
                    setUserTooltipOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex p-4">
        <div className="">
          <Button
            onClick={() => {
              const bucketName = prompt("Enter bucket's name");
              if (!bucketName) return;
              createBucket(bucketName);
            }}
          >
            Create Bucket
          </Button>
        </div>
      </div>
      {buckets.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center text-zinc-600 select-none">
          You have no buckets. Create one to get started.
        </div>
      ) : (
        <div className="overflow-auto">
          <div
            className="grid w-full flex-wrap gap-2 p-4 pt-0"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            }}
          >
            {buckets.map((bucket) => (
              <div
                key={bucket.id}
                className="flex h-full cursor-pointer flex-col overflow-hidden border border-zinc-200 bg-white text-white"
              >
                <div className="flex items-center justify-end bg-blue-300 text-white">
                  <div
                    className="flex h-6 w-6 items-center justify-center border-l border-blue-100 bg-blue-300 hover:bg-blue-600"
                    onClick={() => {
                      setModal(
                        <ActionForm
                          title={`${bucket.name} Users`}
                          onAccept={() => {
                            setModal(null);
                          }}
                          onCancel={() => {
                            setModal(null);
                          }}
                        >
                          {bucket.users.map((user) => {
                            return <div>{user}</div>;
                          })}
                        </ActionForm>,
                      );
                    }}
                  >
                    <FaUser className="text-xs" />
                  </div>
                  <div
                    className="flex h-6 w-6 items-center justify-center border-l border-blue-100 bg-blue-300 hover:bg-blue-600"
                    onClick={() => {
                      const bucketName = prompt(
                        "Enter bucket's new name",
                        bucket.name,
                      );
                      if (!bucketName) return;
                      renameBucket(bucket.id, bucketName)
                        .then(() => {
                          toast.success(
                            `Bucket "${bucket.name}" renamed to "${bucketName}"`,
                          );
                        })
                        .catch((error) => {
                          toast.error(
                            `Failed to rename bucket "${bucket.name}": ${error.message}`,
                          );
                        });
                    }}
                  >
                    <FaPencilAlt className="text-xs" />
                  </div>
                  <div
                    className="flex h-6 w-6 items-center justify-center border-l border-blue-100 bg-blue-300 hover:bg-blue-600"
                    onClick={() => {
                      const userEmail = prompt(
                        `Who would you like to share bucket "${bucket.name}" with?`,
                      );
                      if (!userEmail) return;
                      try {
                        const result = shareBucketSchema.parse({
                          email: userEmail,
                        });
                        shareBucket(bucket.id, result.email)
                          .then(() => {
                            toast.success(
                              `Bucket "${bucket.name}" shared with ${result.email}`,
                            );
                          })
                          .catch((error) => {
                            toast.error(
                              `Failed to share bucket "${bucket.name}": ${error.message}`,
                            );
                          });
                      } catch {
                        return toast.error(`Invalid email ${userEmail}`);
                      }
                    }}
                  >
                    <IoIosShareAlt className="text-xl" />
                  </div>
                  <div
                    className="flex h-6 w-6 items-center justify-center border-l border-blue-100 bg-blue-300 hover:bg-blue-600"
                    onClick={() => {
                      const confirmDelete = confirm(
                        `Are you sure you want to remove bucket "${bucket.name}" from your list? This will not delete the bucket or its contents. It will only remove you from the list of users of the bucket.`,
                      );
                      if (!confirmDelete) return;
                      deleteBucket(bucket.id)
                        .then(() => {
                          toast.success(`Bucket "${bucket.name}" removed`);
                        })
                        .catch((error) => {
                          toast.error(
                            `Failed to remove bucket "${bucket.name}": ${error.message}`,
                          );
                        });
                    }}
                  >
                    <ImCross className="text-xs" />
                  </div>
                </div>
                <div
                  onClick={() => {
                    window.open(`/dashboard/buckets/${bucket.id}`, "_blank");
                  }}
                  className="flex items-center justify-center border-b border-zinc-200 bg-blue-500 py-12 text-4xl font-medium text-white"
                >
                  <FaBucket />
                </div>
                <div
                  onClick={() => {
                    window.open(`/dashboard/buckets/${bucket.id}`, "_blank");
                  }}
                  className="flex flex-col gap-2 px-4 py-2 text-zinc-600"
                >
                  <div className="truncate text-sm">{bucket.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
