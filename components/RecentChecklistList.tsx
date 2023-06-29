import React from "react";
import dayjs from "dayjs";
import { RecentChecklist } from "lib/types";
import { dateTimeToRelative } from "lib/helpers";
import { useTrip } from "providers/trip";
import Link from "next/link";

type Props = {
  checklists: RecentChecklist[];
  locId: string;
};

export default function RecentChecklistList({ checklists, locId }: Props) {
  const { trip } = useTrip();
  const timezone = trip?.timezone;

  return (
    <>
      {checklists.length > 0 && (
        <table className="w-full text-[13px] mt-2">
          <thead className="text-neutral-600 font-bold">
            <tr>
              <th className="text-left pl-1.5">Time ago</th>
              <th className="text-left">#</th>
              <th className="text-right"></th>
            </tr>
          </thead>
          <tbody>
            {checklists.map(({ subId, numSpecies, obsDt, obsTime }, index) => {
              const time = obsTime || "10:00";
              const timestamp = dayjs(`${obsDt} ${time}`).format();
              return (
                <tr key={subId} className="even:bg-neutral-50">
                  <td className="pl-1.5 py-[5px]">
                    <time dateTime={timestamp} title={`${obsDt} ${time}`}>
                      {dateTimeToRelative(`${obsDt} ${time}`, timezone)}
                    </time>
                  </td>
                  <td>{numSpecies}</td>
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
    </>
  );
}
