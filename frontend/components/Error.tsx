import Icon from "components/Icon";

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
          <button className="text-orange-700" onClick={onReload}>
            <Icon name="refresh" className="text-lg inline mr-2" />
            Try again
          </button>
        </p>
      )}
    </div>
  );
}
