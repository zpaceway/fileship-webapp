import { useState } from "react";
import ActionForm from "./ActionForm";
import { TConnector } from "../types";
import { CONNECTORS } from "../constants";
import { FaRegCopy } from "react-icons/fa6";
import { MdAutorenew } from "react-icons/md";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";

type SettingsFormProps = {
  initialValues: {
    connector: TConnector;
    apiKey: string;
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
  const [apiKey, setApiKey] = useState(initialValues.apiKey);

  return (
    <ActionForm
      title="Settings"
      onCancel={onCancel}
      onAccept={() => onAccept({ connector, apiKey })}
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
        <div className="text-sm">
          <label className="p-1 text-xs">API Key:</label>
          <div className="flex items-center gap-2">
            <input
              className="h-9 w-full border border-zinc-300 px-2 text-sm outline-none"
              value={apiKey}
              readOnly
            />
            <FaRegCopy
              className="cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(apiKey);
                toast.info("API Key copied to clipboard");
              }}
            />
            <MdAutorenew
              className="cursor-pointer text-xl"
              onClick={() => {
                const newApiKey = uuidv4().replace(/-/g, "");
                setApiKey(newApiKey);
              }}
            />
          </div>
        </div>
      </div>
    </ActionForm>
  );
};

export default SettingsForm;
