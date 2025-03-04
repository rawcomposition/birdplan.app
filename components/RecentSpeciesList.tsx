import React from "react";
import dayjs from "dayjs";
import useFetchRecentSpecies from "hooks/useFetchRecentSpecies";
import { dateTimeToRelative } from "lib/helpers";
import { useTrip } from "providers/trip";
import Icon from "components/Icon";

type Props = {
  locId: string;
  onSpeciesClick: () => void;
};

const previewCount = 10;

export default function RecentSpeciesList({ locId, onSpeciesClick }: Props) {
  const { recentSpecies, isLoading, error } = useFetchRecentSpecies(locId);
  const [viewAll, setViewAll] = React.useState(false);
  const { trip, locations, setSelectedSpecies } = useTrip();
  const timezone = trip?.timezone;
  const hotspot = locations.find((it) => it._id === locId);
  const favCodes = hotspot?.favs?.map((it) => it.code) || [];

  const filteredObs = viewAll ? recentSpecies : recentSpecies.slice(0, previewCount);

  return (
    <>
      {recentSpecies.length > 0 && (
        <table className="w-full text-[13px] mt-2">
          <thead className="text-neutral-600 font-bold">
            <tr>
              <th className="text-left pl-1.5 py-1">Species</th>
              <th className="text-left">Time ago</th>
              <th className="text-left">#</th>
              <th className="text-right"></th>
            </tr>
          </thead>
          <tbody>
            {filteredObs.map(({ code, name, date, count, checklistId }) => (
              <tr key={`${code}-${checklistId}`} className="even:bg-neutral-50">
                <td className="pl-1.5 py-[5px] relative">
                  {favCodes.includes(code) && (
                    <Icon name="heartSolid" className="text-pink-700 absolute top-[12px] left-[-9px] text-[8px]" />
                  )}
                  <button
                    type="button"
                    className="text-left hover:underline"
                    onClick={() => {
                      setSelectedSpecies({ code, name });
                      onSpeciesClick();
                    }}
                    title="Click to view recent reports"
                  >
                    {name}
                  </button>
                </td>
                <td>
                  <time dateTime={date} title={dayjs(date).format("MMMM D, YYYY")}>
                    {dateTimeToRelative(date, timezone)}
                  </time>
                </td>
                <td>{count}</td>
                <td className="text-right">
                  <a href={`https://ebird.org/checklist/${checklistId}#${code}`} target="_blank" rel="noreferrer">
                    View Checklist
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="text-sm mt-2 text-center">
        {recentSpecies.length > previewCount && !viewAll && (
          <button className="text-sm text-blue-900 mt-2" onClick={() => setViewAll(true)}>
            View all {recentSpecies.length} reports
          </button>
        )}
      </p>
      {isLoading && <p className="text-gray-500 text-sm">Loading...</p>}
      {!isLoading && recentSpecies.length === 0 && !error && (
        <p className="text-gray-500 text-sm">No needs in the last 30 days</p>
      )}
      {error && <p className="text-gray-500 text-sm">Failed to load recent reports</p>}
    </>
  );
}
