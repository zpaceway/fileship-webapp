import { useAtom } from "jotai";
import { modalAtom } from "../atoms";
import Modal from "../components/Modal";

const useModal = () => {
  const [modal, setModal] = useAtom(modalAtom);

  return {
    modal,
    setModal: (children: React.ReactElement | null) => {
      if (!children) {
        setModal(undefined);
        return;
      }
      setModal(<Modal>{children}</Modal>);
    },
  };
};

export default useModal;
