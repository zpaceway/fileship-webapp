/* eslint-disable react-refresh/only-export-components */
import { FaDiscord, FaServer, FaTelegram } from "react-icons/fa";

export const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "/api";

export const CONNECTORS = [
  {
    key: "telegram",
    name: "Telegram",
    icon: <FaTelegram className="text-base text-cyan-500" />,
  },
  {
    key: "discord",
    name: "Discord",
    icon: (
      <FaDiscord className="rounded-full bg-blue-500 p-0.5 text-base text-white" />
    ),
  },
  {
    key: "local",
    name: "Local",
    icon: <FaServer className="text-base text-gray-500" />,
  },
] as const;
export const DEFAULT_CONNECTOR = CONNECTORS[0].key;
