import ObservationList from "../components/observation-list";
import { truncate } from "../helpers";
import Timeago from "../components/timeago";
import images from "../images.json";
import Button from "./button";
import CheckIcon from "../icons/check";
import MapIcon from "../icons/map";

export default function SpeciesList({items, onAddSeen, onRemoveSeen, onToggleExpand, lat, lng}) {
	return (
		<div>
			{items?.map(({name, sciName, code, reports, isExpanded, isSeen}) => {
				const date = reports[0].obsDt;
				const distances = reports.map(({distance}) => distance);
				const shortestDistance = distances.sort((a, b) => (a - b)).shift();
				const distancesAllEqual = distances.every(value => value === distances[0]);
				const imageUrl = images[sciName] || "/bird.svg";
				reports = reports.map(report => ({...report, isClosest: !distancesAllEqual && shortestDistance === report.distance}));
				return (
					<article key={code} className="mb-4 border border-gray-200 bg-white shadow-sm rounded-md w-full">
						<div className="flex">
							<div className="flex-shrink-0">
								<img loading="lazy" src={imageUrl} width="150" height="150" className={`object-cover rounded p-4 w-[140px] h-[140px] xs:w-[150px] xs:h-[150px] ${!images[sciName] ? "opacity-50" : ""}`}/>
							</div>
							<div className="pr-2 pt-3 xs:pr-4 xs:pt-6 w-full">
								<header className="xs:flex xs:justify-between mb-4">
									<h3 className="font-bold xs:text-lg">{truncate(name, 32)}</h3>
									<div className="whitespace-nowrap space-x-2">
										<span className="bg-gray-300 text-gray-600 rounded-sm px-2 py-1 text-xs whitespace-nowrap">
											<Timeago datetime={date}/>
										</span>
										<span dateTime={date} className="bg-gray-300 text-gray-600 rounded-sm px-2 py-1 text-xs whitespace-nowrap">
											<MapIcon className="mr-1 mt-[-2px] text-[0.85em]"/>
											{shortestDistance} mi
										</span>
									</div>
								</header>
								<hr className="mb-4"/>
								<div className="flex gap-2">
									<Button size="sm" onClick={() => onToggleExpand(code)}>
										<span className="hidden xs:block">{isExpanded ? "Hide" : "Show"}&nbsp;</span>{reports.length} {reports.length === 1 ? "Report" : "Reports"}
									</Button>
									{isSeen
										? <Button size="sm" onClick={() => onRemoveSeen(code)}><CheckIcon className="mr-2"/> Seen</Button>
										: <Button size="sm" onClick={() => onAddSeen(code)}>Not Seen</Button>
									}
								</div>
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