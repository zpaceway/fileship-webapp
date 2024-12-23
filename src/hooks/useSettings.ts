import { useAtom } from "jotai";
import { useEffect } from "react";
import { connectorAtom } from "../atoms";
import { Settings } from "../enums";

const useSettings = () => {
  const [connector, setConnector] = useAtom(connectorAtom);

  useEffect(() => {
    localStorage.setItem(Settings.CONNECTOR, connector);
  }, [connector]);

  return {
    connector,
    setConnector,
  };
};

export default useSettings;
