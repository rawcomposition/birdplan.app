import React from "react";
import dayjs from "dayjs";
import { dateTimeToRelative } from "lib/helpers";
import { useTrip } from "providers/trip";
import Link from "next/link";
import useFetchRecentChecklists from "hooks/useFetchRecentChecklists";
import useFetchHotspotObs from "hooks/useFetchHotspotObs";

type Props = {
  locId: string;
  speciesCode?: string;
  speciesName?: string;
};

export default function RecentChecklistList({ locId, speciesCode, speciesName }: Props) {
  const { trip } = useTrip();
  const timezone = trip?.timezone;

  const { groupedChecklists, isLoading, error } = useFetchRecentChecklists(locId);
  const { data: obs } = useFetchHotspotObs(locId, speciesCode);
  const checklists = groupedChecklists.map((group) => group[0]).slice(0, 10);

  return (
    <>
      {checklists.length > 0 && (
        <table className="w-full text-[13px] mt-2">
          <thead className="text-neutral-600 font-bold">
            <tr>
              <th className="text-left pl-1.5">Time ago</th>
              {speciesCode && <th className="text-center max-w-[4rem]">{speciesName}</th>}
              <th className="text-center min-w-[2rem]">Species</th>
              <th className="text-right"></th>
            </tr>
          </thead>
          <tbody>
            {checklists.map(({ subId, numSpecies, obsDt, obsTime }) => {
              const time = obsTime || "10:00";
              const timestamp = dayjs(`${obsDt} ${time}`).format();
              const hasObs = obs?.some((it) => it.checklistId === subId);
              return (
                <tr key={subId} className="even:bg-neutral-50">
                  <td className="pl-1.5 py-[5px]">
                    <time dateTime={timestamp} title={`${obsDt} ${time}`}>
                      {dateTimeToRelative(`${obsDt} ${time}`, timezone)}
                    </time>
                  </td>
                  {speciesCode && <td className="text-center">{hasObs ? "✅" : "❌"}</td>}
                  <td className="text-center">{numSpecies}</td>
                  <td className="text-right">
                    <a href={`https://ebird.org/checklist/${subId}`} target="_blank" rel="noreferrer">
                      View Checklist
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {checklists.length > 0 && (
        <p className="text-sm mt-2 text-center">
          <Link
            target="_blank"
            className="text-sm text-blue-900 mt-2"
            href={`https://ebird.org/hotspot/${locId}/activity?yr=all&m=`}
          >
            View all checklists
          </Link>
        </p>
      )}
      {checklists.length === 0 && <p className="text-gray-500 text-sm">No recent checklists</p>}
      {isLoading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-gray-500 text-sm">Failed to load observations</p>}
    </>
  );
}
