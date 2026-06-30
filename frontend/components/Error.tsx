import Icon from "components/Icon";
import { Button } from "components/ui/button";

type Props = {
  onReload?: () => void;
  message?: string;
};

export default function Error({ onReload, message }: Props) {
  return (
    <div className="max-w-sm text-center mx-auto my-12">
      <h2 className="text-xl text-gray-600">{message || "Sorry! Something went wrong..."}</h2>
      {onReload && (
        <p className="my-2">
          <Button variant="outline" shape="pill" className="inline-flex items-center gap-2" onClick={onReload}>
            <Icon name="refresh" className="text-lg" />
            Try again
          </Button>
        </p>
      )}
    </div>
  );
}
