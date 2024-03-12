import React from "react";
import Icon from "components/Icon";
import { dateTimeToRelative } from "lib/helpers";
import { useTrip } from "providers/trip";
import dayjs from "dayjs";
import useFetchHotspotObs from "hooks/useFetchHotspotObs";
import useFetchRecentChecklists from "hooks/useFetchRecentChecklists";

type Props = {
  locId: string;
  speciesCode: string;
};

const previewCount = 10;

export default function ObsList({ locId, speciesCode }: Props) {
  const [viewAll, setViewAll] = React.useState(false);
  const { trip } = useTrip();
  const timezone = trip?.timezone;

  const { data, isLoading, error } = useFetchHotspotObs(locId, speciesCode);
  const { checklists } = useFetchRecentChecklists(locId);

  const formattedObs =
    data?.map((it) => {
      const recentChecklist = checklists?.find((checklist) => checklist.subId === it.checklistId);
      return {
        ...it,
        date:
          recentChecklist && recentChecklist.obsTime
            ? `${recentChecklist.obsDt} ${recentChecklist.obsTime}`
            : `${it.date} 9:00 am`,
      };
    }) || [];

  const filteredObs = viewAll ? formattedObs : formattedObs.slice(0, previewCount);

  return (
    <>
      <table className="w-full text-[13px] mt-2">
        <thead className="text-neutral-600 font-bold">
          <tr>
            <th className="text-left pl-1.5">Time ago</th>
            <th className="text-left">#</th>
            <th className="text-center">Evidence</th>
            <th className="text-right"></th>
          </tr>
        </thead>
        <tbody>
          {filteredObs.map(({ date, count, evidence, checklistId }, index) => (
            <tr key={`${locId}-${speciesCode}-${index}`} className="even:bg-neutral-50">
              <td className="pl-1.5 py-[5px]">
                <time dateTime={date} title={dayjs(date).format("MMMM D, YYYY")}>
                  {dateTimeToRelative(date, timezone)}
                </time>
              </td>
              <td>{count}</td>
              <td className="text-center">
                <a href={`https://ebird.org/checklist/${checklistId}#${speciesCode}`} target="_blank" rel="noreferrer">
                  {evidence === "N" && <Icon name="comment" className="text-gray-600 text-xs" />}
                  {evidence === "P" && <Icon name="camera" className="text-lime-700" />}
                  {evidence === "A" && <Icon name="speaker" className="text-sky-700" />}
                </a>
              </td>
              <td className="text-right">
                <a href={`https://ebird.org/checklist/${checklistId}#${speciesCode}`} target="_blank" rel="noreferrer">
                  View Checklist
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm mt-2 text-center">
        {(data?.length || 0) > previewCount && !viewAll && (
          <button className="text-sm text-blue-900 mt-2" onClick={() => setViewAll(true)}>
            View all {data?.length} reports
          </button>
        )}
      </p>
      {isLoading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-500 text-sm">Failed to load observations</p>}
    </>
  );
}
