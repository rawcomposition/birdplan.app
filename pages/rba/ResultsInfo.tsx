import Timeago from "components/Timeago";

type Props = {
  count: number;
  total: number;
  lastUpdate?: string;
  onReload: () => void;
};

export default function ResultsInfo({ count, total, lastUpdate, onReload }: Props) {
  return (
    <div className="flex justify-between mb-4">
      <span className="text-xs text-gray-500">
        Showing {count} of {total} results
      </span>
      {lastUpdate && (
        <span className="text-xs text-gray-500">
          Updated <Timeago datetime={lastUpdate} />
          &nbsp;-&nbsp;
          <button type="button" className="text-blue-900" onClick={onReload}>
            Reload
          </button>
        </span>
      )}
    </div>
  );
}
