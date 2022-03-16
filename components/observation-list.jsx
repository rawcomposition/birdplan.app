import { truncate } from "../helpers";

export default function ObservationList({reports}) {	
	return (
		<ul className="pl-4 pr-4 pb-4 flex flex-col gap-4">
			{reports?.map(({locName, subnational2Name, subnational1Name, subId, obsId, obsDt, userDisplayName, lat, lng, distance, isClosest}) => (
				<li key={obsId + userDisplayName} className="rounded-sm bg-white">
					<div className="flex justify-between">
						<h4 className="text-orange-900">
							{truncate(locName, 32)}, {subnational2Name}, {subnational1Name}
						</h4>
						<span dateTime={date} className="bg-gray-100 rounded-sm ml-4 px-2 py-1 text-xs">{distance} mi</span>
					</div>
					
					{isClosest &&
						<>
							<span dateTime={date} className="bg-green-400 rounded-sm ml-4 px-2 py-1 text-xs">Closest</span>
							<br/>
						</>
					}
					<span className="text-gray-700 text-sm">{dayjs(obsDt).fromNow()} by {userDisplayName}</span>
					<br/>
					<a href={`https://ebird.org/checklist/${subId}`}>View Checklist</a> | <a href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}>Directions</a>
				</li>
			))}
		</ul>
	)
}