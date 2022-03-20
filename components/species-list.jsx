import Button from "./button";
import CheckIcon from "../icons/check";
import Species from "./species";
import SpeciesHeader from "./species-header";
import SpeciesImage from "./species-image";

export default function SpeciesList({items, onAddSeen, onRemoveSeen, onToggleExpand, lat, lng}) {
	return (
		<div>
			{items?.map(({name, sciName, code, reports, isExpanded, isSeen}) => {
				const date = reports[0].obsDt;
				const distances = reports.map(({distance}) => distance);
				const shortestDistance = distances.sort((a, b) => (a - b)).shift();
				const distancesAllEqual = distances.every(value => value === distances[0]);
				reports = reports.map(report => ({...report, isClosest: !distancesAllEqual && shortestDistance === report.distance}));
				return (
					<Species key={code} reports={reports} userLat={lat} userLng={lng}>
						<SpeciesImage sciName={sciName}/>
						<div className="pr-2 pt-3 xs:pr-4 xs:pt-6 w-full">
							<SpeciesHeader name={name} date={date} distance={shortestDistance}/>
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
					</Species>
				)
			})}
		</div>
	)
}