export const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "/srv";

export const CONNECTORS = [
  {
    key: "telegram",
    name: "Telegram",
  },
  {
    key: "discord",
    name: "Discord",
  },
  {
    key: "local",
    name: "Local",
  },
] as const;
export const DEFAULT_CONNECTOR = CONNECTORS[0].key;
