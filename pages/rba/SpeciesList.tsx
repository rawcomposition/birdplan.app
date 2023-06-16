import Button from "components/Button";
import ObservationList from "./ObservationList";
import SpeciesHeader from "./SpeciesHeader";
import { Species as SpeciesT } from "lib/types";
import images from "lib/images.json";

type Props = {
  items: SpeciesT[];
  expanded: string[];
  onToggleExpand: (code: string) => void;
  lat: number;
  lng: number;
};

export default function SpeciesList({ items, expanded, onToggleExpand, lat, lng }: Props) {
  return (
    <div>
      {items?.map(({ name, sciName, code, reports }) => {
        const isExpanded = expanded.includes(code);
        const date = reports[0].obsDt;
        const distances = reports.map(({ distance }) => distance);
        const shortestDistance = distances.sort((a, b) => a - b).shift();
        const distancesAllEqual = distances.every((value) => value === distances[0]);
        reports = reports.map((report) => ({
          ...report,
          isClosest: !distancesAllEqual && shortestDistance === report.distance,
        }));

        //@ts-ignore
        const img = images[sciName];
        const imgUrl = img || "/placeholder.png";

        return (
          <article key={code} className="mb-4 border border-gray-200 bg-white shadow-sm rounded-md w-full">
            <div className="flex">
              <div className="flex-shrink-0">
                <img
                  loading="lazy"
                  src={imgUrl}
                  width="150"
                  height="150"
                  className={`object-cover rounded p-4 w-[140px] h-[140px] xs:w-[150px] xs:h-[150px] ${
                    !img ? "opacity-50" : ""
                  }`}
                />
              </div>
              <div className="pr-2 pt-3 xs:pr-4 xs:pt-6 w-full pb-4">
                <SpeciesHeader name={name} date={date} distance={shortestDistance || 0} />
                <hr className="mb-4" />
                <div className="flex gap-2">
                  <Button size="sm" className="whitespace-nowrap" onClick={() => onToggleExpand(code)}>
                    <span className="hidden xs:inline">{isExpanded ? "Hide" : "Show"}&nbsp;</span>
                    {reports.length} {reports.length === 1 ? "Report" : "Reports"}
                  </Button>
                </div>
              </div>
            </div>
            {isExpanded && (
              <ul className="pl-4 pr-4 pb-4 flex flex-col gap-4">
                <ObservationList items={reports} userLat={lat} userLng={lng} />
              </ul>
            )}
          </article>
        );
      })}
    </div>
  );
}
