import React from "react";
import Icon from "components/Icon";
import { dateTimeToRelative } from "lib/helpers";
import { useTrip } from "providers/trip";
import dayjs from "dayjs";
import useFetchHotspotObs from "hooks/useFetchHotspotObs";
import useFetchRecentChecklists from "hooks/useFetchRecentChecklists";
import Alert from "components/Alert";

type Props = {
  hotspotId: string;
  speciesCode: string;
};

const previewCount = 10;

export default function ObsList({ hotspotId, speciesCode }: Props) {
  const [viewAll, setViewAll] = React.useState(false);
  const { trip } = useTrip();

  const { data, isLoading, error, refetch } = useFetchHotspotObs(trip?._id || "", hotspotId, speciesCode);
  const { checklists } = useFetchRecentChecklists(hotspotId);

  const formattedObs =
    data?.map((it) => {
      const recentChecklist = checklists?.find((checklist) => checklist.subId === it.checklistId);
      return {
        ...it,
        region:
          recentChecklist?.loc.subnational2Code ||
          recentChecklist?.loc.subnational1Code ||
          recentChecklist?.loc.countryCode ||
          "",
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
          {filteredObs.map(({ date, count, evidence, checklistId, region }, index) => (
            <tr key={`${hotspotId}-${speciesCode}-${index}`} className="even:bg-neutral-50">
              <td className="pl-1.5 py-[5px]">
                <time dateTime={date} title={dayjs(date).format("MMMM D, YYYY")}>
                  {dateTimeToRelative(date, region)}
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
      {isLoading && (
        <Alert style="info" className="-mx-1 my-1">
          <Icon name="loading" className="text-xl animate-spin" />
          Loading observations...
        </Alert>
      )}

      {error && (
        <Alert style="error" className="-mx-1 my-1">
          <Icon name="xMarkCircle" className="text-xl" />
          Failed to load observations
          <button className="text-sky-600 font-medium" onClick={() => refetch()}>
            Retry
          </button>
        </Alert>
      )}
    </>
  );
}
