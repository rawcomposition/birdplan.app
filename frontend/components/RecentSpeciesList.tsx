import React from "react";
import dayjs from "dayjs";
import useFetchRecentSpecies from "hooks/useFetchRecentSpecies";
import { dateTimeToRelative } from "lib/helpers";
import { useTrip } from "hooks/useTrip";
import Icon from "components/Icon";
import { Button } from "components/ui/button";
import EmptyState from "components/EmptyState";
import LoadingState from "components/LoadingState";

type Props = {
  locId: string;
  onSpeciesClick: (species: { code: string; name: string }) => void;
};

const previewCount = 10;

export default function RecentSpeciesList({ locId, onSpeciesClick }: Props) {
  const { recentSpecies, isLoading, error, refetch } = useFetchRecentSpecies(locId);
  const [viewAll, setViewAll] = React.useState(false);
  const { trip } = useTrip();
  const hotspot = trip?.hotspots.find((it) => it.id === locId);
  const favCodes = hotspot?.favs?.map((it) => it.code) || [];
  const regionCode = trip?.region.split(",")[0] || "";

  const filteredObs = viewAll ? recentSpecies : recentSpecies.slice(0, previewCount);

  return (
    <>
      {recentSpecies.length > 0 && (
        <table className="w-full text-[13px] mt-2">
          <thead className="text-secondary-foreground font-bold">
            <tr>
              <th className="text-left pl-1.5 py-1">Species</th>
              <th className="text-left">Time ago</th>
              <th className="text-left">#</th>
              <th className="text-right"></th>
            </tr>
          </thead>
          <tbody>
            {filteredObs.map(({ code, name, date, count, checklistId }) => (
              <tr key={`${code}-${checklistId}`} className="even:bg-muted/50">
                <td className="pl-1.5 py-[5px] relative">
                  {favCodes.includes(code) && (
                    <Icon name="heartSolid" className="text-pink-700 absolute top-[12px] left-[-9px] text-[8px]" />
                  )}
                  <button
                    type="button"
                    className="text-left hover:underline"
                    onClick={() => onSpeciesClick({ code, name })}
                    title="Click to view recent reports"
                  >
                    {name}
                  </button>
                </td>
                <td>
                  <time dateTime={date} title={dayjs(date).format("MMMM D, YYYY")}>
                    {dateTimeToRelative(date, regionCode)}
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
          <Button variant="link" className="text-sm" onClick={() => setViewAll(true)}>
            View all {recentSpecies.length} reports
          </Button>
        )}
      </p>
      {error ? (
        <EmptyState inline variant="destructive" title="Failed to load recent species" onRetry={() => refetch()} />
      ) : isLoading ? (
        <LoadingState inline />
      ) : recentSpecies.length === 0 ? (
        <EmptyState inline title="No recent needs in the last 30 days" />
      ) : null}
    </>
  );
}
