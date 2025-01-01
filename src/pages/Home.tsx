import { FaGithub } from "react-icons/fa6";

const HomePage = () => {
  return (
    <div className="fixed inset-0">
      <div className="relative flex h-full w-full flex-col items-center justify-center bg-blue-500 p-4 text-white">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Fileship</h1>
        <p className="mb-8 max-w-md text-center text-lg">
          Fileship is an open source solution to manage your files through
          different connectors including Telegram, Discord, and local storage.
        </p>
        <div className="flex space-x-4">
          <a href="/auth" className="bg-white px-4 py-2 text-blue-500">
            Get Started
          </a>
        </div>
        <div className="absolute bottom-4 flex gap-2">
          <a
            href="https://github.com/zpaceway/fileship-webapp"
            className="flex items-center gap-2 px-4 py-2 text-white"
          >
            <FaGithub />
            <div>Frontend</div>
          </a>
          <div className="border-r border-white"></div>
          <a
            href="https://github.com/zpaceway/fileship-backend"
            className="flex items-center gap-2 px-4 py-2 text-white"
          >
            <FaGithub />
            <div>Backend</div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
