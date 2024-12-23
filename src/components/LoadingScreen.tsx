import { CgSpinner } from "react-icons/cg";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <CgSpinner className="animate-spin text-4xl" />
    </div>
  );
};

export default LoadingScreen;
