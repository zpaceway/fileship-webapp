import { useState } from "react";
import ActionModal from "./ActionModal";
import { TConnector } from "../types";
import { CONNECTORS } from "../constants";

type SettingsModalProps = {
  initialValues: {
    connector: TConnector;
  };
  onCancel: () => void;
  onAccept: (values: SettingsModalProps["initialValues"]) => void;
};

const SettingsModal = ({
  initialValues,
  onCancel,
  onAccept,
}: SettingsModalProps) => {
  const [connector, setConnector] = useState(initialValues.connector);

  return (
    <ActionModal
      title="Settings"
      onCancel={onCancel}
      onAccept={() => onAccept({ connector })}
      body={
        <div className="flex flex-col gap-2">
          <div className="text-sm">
            <label className="p-1 text-xs">Connector:</label>
            <select
              className="h-9 w-full border px-2 text-sm outline-none"
              defaultValue={connector}
              onChange={(e) => {
                setConnector(e.target.value as TConnector);
              }}
            >
              {CONNECTORS.map((fileConnector) => (
                <option key={fileConnector.key} value={fileConnector.key}>
                  {fileConnector.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      }
    />
  );
};

export default SettingsModal;
