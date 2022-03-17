import { truncate } from "../helpers";
import Timeago from "../components/timeago";

export default function ObservationList({userLat, userLng, items}) {
	return (
		<ul className="pl-4 pr-4 pb-4 flex flex-col gap-4">
			{items?.map(({locName, subnational2Name, subnational1Name, subId, obsId, obsDt, userDisplayName, lat, lng, distance, isClosest}) => (
				<li key={obsId + userDisplayName} className="rounded-sm bg-white">
					<div className="flex justify-between">
						<h4 className="text-orange-900">
							{truncate(locName, 32)}, {subnational2Name}, {subnational1Name}
						</h4>
						<span className="bg-gray-100 rounded-sm ml-4 px-2 py-1 text-xs">{distance} mi</span>
					</div>
					
					{isClosest &&
						<>
							<span className="bg-green-400 rounded-sm ml-4 px-2 py-1 text-xs">Closest</span>
							<br/>
						</>
					}
					<span className="text-gray-700 text-sm">
						<Timeago datetime={obsDt} className="bg-gray-300 rounded-sm ml-4 px-2 py-1 text-xs whitespace-nowrap"/> by {userDisplayName}
					</span>
					<br/>
					<a href={`https://ebird.org/checklist/${subId}`} target="_blank" rel="noreferrer">View Checklist</a>
					&nbsp;|&nbsp;
					<a href={`https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${lat},${lng}`} target="_blank" rel="noreferrer">Directions</a>
				</li>
			))}
		</ul>
	)
}