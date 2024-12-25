import Button from "./Button";

type ActionFormProps = {
  children: React.ReactNode;
  title: string;
  onAccept: () => void;
  onCancel: () => void;
};

const ActionForm = ({
  children,
  title,
  onAccept,
  onCancel,
}: ActionFormProps) => {
  return (
    <div className="flex w-full flex-col gap-4 bg-white p-4 shadow">
      <div className="font-medium">{title}</div>
      <div className="text-sm">{children}</div>
      <div className="flex gap-4">
        <Button onClick={onAccept}>Accept</Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ActionForm;
