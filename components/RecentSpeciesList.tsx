import React from "react";
import dayjs from "dayjs";
import useFetchRecentSpecies from "hooks/useFetchRecentSpecies";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type Props = {
  locId: string;
};

const previewCount = 10;

export default function RecentSpeciesList({ locId }: Props) {
  const { recentSpecies, loading } = useFetchRecentSpecies(locId);
  const [viewAll, setViewAll] = React.useState(false);

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
            {filteredObs.map(({ code, name, date, count, checklistId }, index) => (
              <tr key={`${code}-${checklistId}`} className="even:bg-neutral-50">
                <td className="pl-1.5 py-[5px]">{name}</td>
                <td>
                  <time dateTime={date} title={dayjs(date).format("MMMM D, YYYY")}>
                    {dayjs(date).fromNow()?.replace(" ago", "")?.replace("a ", "1 ").replace("an ", "1 ")}
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
      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {!loading && recentSpecies.length === 0 && <p className="text-gray-500 text-sm">No needs in the last 30 days</p>}
    </>
  );
}
