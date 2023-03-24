import Button from "components/Button";
import CheckIcon from "icons/check";
import Species from "components/Species";
import SpeciesHeader from "components/SpeciesHeader";
import SpeciesImage from "components/SpeciesImage";
import { Species as SpeciesT } from "lib/types";

type Props = {
  items: SpeciesT[];
  fading: string[];
  lifelist: string[];
  expanded: string[];
  onAddSeen: (code: string) => void;
  onRemoveSeen: (code: string) => void;
  onToggleExpand: (code: string) => void;
  lat: number;
  lng: number;
};

export default function SpeciesList({
  items,
  fading,
  lifelist,
  expanded,
  onAddSeen,
  onRemoveSeen,
  onToggleExpand,
  lat,
  lng,
}: Props) {
  return (
    <div>
      {items?.map(({ name, sciName, code, reports }) => {
        const isPending = fading.includes(code);
        const isExpanded = expanded.includes(code);
        const isOnLifelist = lifelist.includes(code);
        const date = reports[0].obsDt;
        const distances = reports.map(({ distance }) => distance);
        const shortestDistance = distances.sort((a, b) => a - b).shift();
        const distancesAllEqual = distances.every((value) => value === distances[0]);
        reports = reports.map((report) => ({
          ...report,
          isClosest: !distancesAllEqual && shortestDistance === report.distance,
        }));
        return (
          <Species
            isExpanded={isExpanded}
            key={code}
            reports={reports}
            userLat={lat}
            userLng={lng}
            isFadingOut={isPending}
          >
            <SpeciesImage sciName={sciName} />
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
          </Species>
        );
      })}
    </div>
  );
}
