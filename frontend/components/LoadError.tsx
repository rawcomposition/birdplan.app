import Icon from "components/Icon";
import { Alert } from "components/ui/alert";
import { Button } from "components/ui/button";
import { cn } from "lib/utils";

type Props = {
  message: string;
  onRetry: () => void;
  className?: string;
};

export default function LoadError({ message, onRetry, className }: Props) {
  return (
    <Alert variant="destructive" className={cn("-mx-1 my-1", className)}>
      <Icon name="xMarkCircle" className="text-xl" />
      <span>
        {message} <span className="text-destructive/40">—</span>{" "}
        <Button variant="link-danger" className="px-0 py-0" onClick={onRetry}>
          Retry
        </Button>
      </span>
    </Alert>
  );
}
