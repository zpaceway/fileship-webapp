type ActionModalProps = {
  body: React.ReactNode;
  title: string;
  onAccept: () => void;
  onCancel: () => void;
};

const ActionModal = ({ body, title, onAccept, onCancel }: ActionModalProps) => {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-400 bg-opacity-50">
      <div className="flex w-full max-w-xs flex-col gap-4 bg-white p-4 shadow">
        <div className="font-medium">{title}</div>
        <div className="text-sm">{body}</div>
        <div className="flex gap-4">
          <button
            className="h-9 w-full bg-rose-500 px-2 text-white"
            onClick={onAccept}
          >
            Accept
          </button>
          <button
            className="h-9 w-full bg-blue-400 px-2 text-white"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
