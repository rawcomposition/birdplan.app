import React from "react";
import { Observation, RecentChecklist } from "lib/types";
import toast from "react-hot-toast";
import CameraIcon from "icons/Camera";
import CommentIcon from "icons/Comment";
import SpeakerIcon from "icons/Speaker";
import { dateTimeToRelative } from "lib/helpers";
import { useTrip } from "providers/trip";
import dayjs from "dayjs";

type Props = {
  locId: string;
  speciesCode: string;
  recentChecklists: RecentChecklist[];
};

const previewCount = 10;

export default function ObsList({ locId, speciesCode, recentChecklists }: Props) {
  const [obs, setObs] = React.useState<Observation[]>([]);
  const [viewAll, setViewAll] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const { trip } = useTrip();
  const timezone = trip?.timezone;

  const formattedObs =
    obs.map((it) => {
      const recentChecklist = recentChecklists?.find((checklist) => checklist.subId === it.checklistId);
      return {
        ...it,
        date: recentChecklist ? `${recentChecklist.obsDt} ${recentChecklist.obsTime}` : `${it.date} 9:00 am`,
      };
    }) || [];

  React.useEffect(() => {
    if (!locId || !speciesCode) return;
    (async () => {
      try {
        const res = await fetch(`/api/hotspot-obs?locId=${locId}&speciesCode=${speciesCode}`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        setObs(json || []);
      } catch (err) {
        toast.error("Failed to load observations");
      }
      setLoading(false);
    })();
  }, [locId, speciesCode]);

  const filteredObs = viewAll ? formattedObs : formattedObs.slice(0, previewCount);

  return (
    <>
      <table className="w-full text-[13px] mt-2">
        <thead className="text-neutral-600 font-bold">
          <tr>
            <th className="text-left pl-1.5 py-1">Time ago</th>
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
                  {evidence === "N" && <CommentIcon className="text-gray-600 text-xs" />}
                  {evidence === "P" && <CameraIcon className="text-lime-700" />}
                  {evidence === "A" && <SpeakerIcon className="text-sky-700" />}
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
        {obs.length > previewCount && !viewAll && (
          <button className="text-sm text-blue-900 mt-2" onClick={() => setViewAll(true)}>
            View all {obs.length} reports
          </button>
        )}
      </p>
      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
    </>
  );
}
