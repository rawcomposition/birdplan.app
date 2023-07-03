import React from "react";
import dayjs from "dayjs";
import { dateTimeToRelative } from "lib/helpers";
import { useTrip } from "providers/trip";
import Link from "next/link";
import useFetchRecentChecklists from "hooks/useFetchRecentChecklists";
import useFetchHotspotObs from "hooks/useFetchHotspotObs";
import useFetchHotspotInfo from "hooks/useFetchHotspotInfo";
import Loading from "icons/Loading";

type Props = {
  locId: string;
  speciesCode?: string;
  speciesName?: string;
};

export default function RecentChecklistList({ locId, speciesCode, speciesName }: Props) {
  const { trip } = useTrip();
  const timezone = trip?.timezone;

  const { data: info } = useFetchHotspotInfo(locId);
  const { groupedChecklists, isLoading, error } = useFetchRecentChecklists(locId);
  const { data: obs, isLoading: isLoadingObs, error: obsError } = useFetchHotspotObs(locId, speciesCode);
  const checklists = groupedChecklists.map((group) => group[0]).slice(0, 10);

  const successRate = info?.numChecklists && obs?.length ? obs.length / info.numChecklists : null;

  return (
    <>
      {speciesCode && (
        <div className="text-sm -mx-1 my-1 bg-sky-100 text-sky-800 py-2.5 px-3 rounded">
          {speciesName}
          <br />
          {isLoadingObs && <Loading className="text-xl animate-spin" />}
          {successRate && (
            <>
              <strong className="text-xl">{Math.round(successRate * 100)}%</strong> of{" "}
              {info?.numChecklists?.toLocaleString()} checklists
            </>
          )}
          {!!obsError && <span className="text-red-500">Failed to load recent reports</span>}
        </div>
      )}
      {checklists.length > 0 && (
        <table className="w-full text-[13px] mt-2">
          <thead className="text-neutral-600 font-bold">
            <tr>
              <th className="text-left pl-1.5">Time ago</th>
              {speciesCode && <th className="text-center">{speciesName}</th>}
              {!speciesCode && <th className="text-center min-w-[2rem]">Species Count</th>}
              <th className="text-right"></th>
            </tr>
          </thead>
          <tbody>
            {checklists.map(({ subId, numSpecies, obsDt, obsTime }) => {
              const time = obsTime || "10:00";
              const timestamp = dayjs(`${obsDt} ${time}`).format();
              const hasObs = obs?.some((it) => it.checklistId === subId);
              const obsLabel = !obs?.length ? "--" : hasObs ? "✅" : "❌";
              return (
                <tr key={subId} className="even:bg-neutral-50">
                  <td className="pl-1.5 py-[5px]">
                    <time dateTime={timestamp} title={`${obsDt} ${time}`}>
                      {dateTimeToRelative(`${obsDt} ${time}`, timezone)}
                    </time>
                  </td>
                  {speciesCode && <td className="text-center">{obsLabel}</td>}
                  {!speciesCode && <td className="text-center">{numSpecies}</td>}
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
      {!isLoading && checklists.length === 0 && <p className="text-gray-500 text-sm">No recent checklists</p>}
      {isLoading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-500 text-sm">Failed to load checklists</p>}
    </>
  );
}
