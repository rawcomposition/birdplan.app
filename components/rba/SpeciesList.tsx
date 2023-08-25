import ObservationList from "./ObservationList";
import { Species as SpeciesT } from "lib/types";
import { truncate } from "lib/helpers";
import Timeago from "components/Timeago";
import MapIcon from "icons/map";
import clsx from "clsx";

type Props = {
  items: SpeciesT[];
  expanded: string[];
  onToggleExpand: (code: string) => void;
  lat: number;
  lng: number;
};

export default function SpeciesList({ items, expanded, onToggleExpand, lat, lng }: Props) {
  const getAbaCodeColor = (code?: number) => {
    if (code && code <= 3) return "border-gray-200 text-gray-800";
    if (code === 4) return "border-red-700 text-red-800";
    if (code === 5) return "border-red-700 text-red-800";
    if (!code) return "border-gray-900 text-gray-900";
  };
  return (
    <div>
      {items?.map(({ name, code, reports, abaCode }) => {
        const isExpanded = expanded.includes(code);
        const date = reports[0].obsDt;
        const distances = reports.map(({ distance }) => distance);
        const shortestDistance = distances.sort((a, b) => a - b).shift() || 0;
        const distancesAllEqual = distances.every((value) => value === distances[0]);
        reports = reports.map((report) => ({
          ...report,
          isClosest: !distancesAllEqual && shortestDistance === report.distance,
        }));

        return (
          <article key={code} className="mb-4 border border-gray-200 bg-white shadow-sm rounded-md w-full">
            <div className="flex cursor-pointer" onClick={() => onToggleExpand(code)}>
              <div className="flex-shrink-0 p-4 mr-4 flex items-center">
                <span
                  className={clsx(
                    "w-6 h-6 border rounded-full flex items-center justify-center font-bold text-[13px]",
                    getAbaCodeColor(abaCode),
                    !abaCode && "text-[9.5px]"
                  )}
                >
                  {abaCode || "N/A"}
                </span>
              </div>
              <div className="pr-2 pt-3 xs:pr-4 w-full py-4 xs:flex xs:justify-between">
                <div className="flex flex-col gap-[1px]">
                  <h3 className="font-bold text-gray-800">{truncate(name, 32)}</h3>
                  <span className="text-[13px] text-gray-600">
                    {reports.length} {reports.length === 1 ? "Report" : "Reports"}
                  </span>
                </div>
                <div className="whitespace-nowrap flex gap-2 items-center mt-2 xs:mt-0">
                  <span className="bg-gray-300 text-gray-600 rounded-sm px-2 py-1 text-xs whitespace-nowrap">
                    <Timeago datetime={date} />
                  </span>
                  <span
                    className={clsx(
                      "rounded-sm px-2 py-1 text-xs whitespace-nowrap",
                      shortestDistance <= 250 ? "bg-lime-600 text-white" : "bg-gray-300 text-gray-600"
                    )}
                  >
                    <MapIcon className="mr-1 mt-[-2px] text-[0.85em]" />
                    {shortestDistance} mi
                  </span>
                </div>
              </div>
              <div className="flex items-center pr-4 pl-1">
                <button
                  type="button"
                  className={clsx("w-5 h-5 transition-all ease-in-out", isExpanded && "rotate-180")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                    <path d="M239 401c9.4 9.4 24.6 9.4 33.9 0L465 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-175 175L81 175c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L239 401z" />
                  </svg>
                </button>
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
