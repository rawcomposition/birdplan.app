import React from "react";
import dayjs from "dayjs";
import { RecentChecklist } from "lib/types";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type Props = {
  checklists: RecentChecklist[];
};

export default function RecentChecklistList({ checklists }: Props) {
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
              const timeAgo = obsDt && obsTime ? dayjs(`${obsDt} ${obsTime}`).fromNow() : "Unknown";
              const timestamp = dayjs(`${obsDt} ${obsTime}`).format();
              return (
                <tr key={subId} className="even:bg-neutral-50">
                  <td className="pl-1.5 py-[5px]">
                    <time dateTime={timestamp} title={`${obsDt} ${obsTime}`}>
                      {timeAgo?.replace(" ago", "")?.replace("a ", "1 ").replace("an ", "1 ")}
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
      {checklists.length === 0 && <p className="text-gray-500 text-sm">No recent checklists</p>}
    </>
  );
}
