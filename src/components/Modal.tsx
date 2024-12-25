import useModal from "../hooks/useModal";

type ActionFormProps = {
  children: React.ReactNode;
};

const Modal = ({ children }: ActionFormProps) => {
  const { setModal } = useModal();
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-zinc-400/50 p-4"
      onClick={() => {
        setModal(null);
      }}
    >
      <div
        className="w-full max-w-xs"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
