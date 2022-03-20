import Timeago from "../components/timeago";

export default function ResultsInfo({count, total, lastUpdate, onReload}) {
	return (
		<div className="flex justify-between mb-4">
			<span className="text-xs text-gray-500">Showing {count} of {total} results</span>
			{lastUpdate && 
				<span className="text-xs text-gray-500">
					Updated <Timeago datetime={lastUpdate}/>&nbsp;-&nbsp;
					<button type="button" className="text-blue-900" onClick={onReload}>Reload</button>
				</span>
			}
		</div>
	);
}