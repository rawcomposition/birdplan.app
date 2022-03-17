import ObservationList from "../components/observation-list";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import images from "../images.json";

export default function SpeciesList({items, onSeen, onToggle, lat, lng}) {
	return (
		<div>
			{items?.map(({name, sciName, code, reports, isExpanded}) => {
				const date = reports[0].obsDt;
				const distances = reports.map(({distance}) => distance);
				const shortestDistance = distances.sort((a, b) => (a - b)).shift();
				const distancesAllEqual = distances.every(value => value === distances[0]);
				const imageUrl = images[sciName] || "/bird.svg";
				reports = reports.map(report => ({...report, isClosest: !distancesAllEqual && shortestDistance === report.distance}));
				return (
					<article key={code} className="mb-4 rounded-sm shadow-sm bg-white">
						<div className="flex">
							<div className="flex-shrink-0">
								<img src={imageUrl} width="150" height="150" className={`object-cover rounded p-4 w-[150px] h-[150px] ${!images[sciName] ? "opacity-50" : ""}`}/>
							</div>
							<div className="pr-4 pt-6 w-full">
								<header className="flex justify-between">
									<h3 className="font-bold text-lg mb-4">{name}</h3>
									<div>
										<time dateTime={date} className="bg-gray-300 rounded-sm ml-4 px-2 py-1 text-xs whitespace-nowrap">{dayjs(date).fromNow()}</time>
										<span dateTime={date} className="bg-gray-300 rounded-sm ml-4 px-2 py-1 text-xs whitespace-nowrap">{shortestDistance} mi</span>
									</div>
								</header>
								<hr className="mb-4"/>
								<button type="button" className="inline-flex justify-center py-1 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500" onClick={() => onToggle(code)}>{isExpanded ? "Hide" : "Show"} {reports.length} {reports.length === 1 ? "Report" : "Reports"}</button>
								<button type="button" className="ml-2 inline-flex justify-center py-1 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500" onClick={() => onSeen(code)}>Seen</button>
							</div>
						</div>
						{isExpanded && <ul className="pl-4 pr-4 pb-4 flex flex-col gap-4">
							<ObservationList items={reports} userLat={lat} userLng={lng}/>
						</ul>}
					</article>
				)
			})}
		</div>
	)
}