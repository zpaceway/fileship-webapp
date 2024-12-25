import { useState } from "react";
import ActionForm from "./ActionForm";
import { TConnector } from "../types";
import { CONNECTORS } from "../constants";

type SettingsFormProps = {
  initialValues: {
    connector: TConnector;
  };
  onCancel: () => void;
  onAccept: (values: SettingsFormProps["initialValues"]) => void;
};

const SettingsForm = ({
  initialValues,
  onCancel,
  onAccept,
}: SettingsFormProps) => {
  const [connector, setConnector] = useState(initialValues.connector);

  return (
    <ActionForm
      title="Settings"
      onCancel={onCancel}
      onAccept={() => onAccept({ connector })}
    >
      <div className="flex flex-col gap-2">
        <div className="text-sm">
          <label className="p-1 text-xs">Connector:</label>
          <select
            className="h-9 w-full border border-zinc-300 px-2 text-sm outline-none"
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
    </ActionForm>
  );
};

export default SettingsForm;
