import React from "react";
import { Observation } from "lib/types";
import toast from "react-hot-toast";
import dayjs from "dayjs";

type Props = {
  locId: string;
  speciesCode: string;
  speciesName?: string;
};

const previewCount = 10;

export default function ObsList({ locId, speciesCode, speciesName }: Props) {
  const [obs, setObs] = React.useState<Observation[]>([]);
  const [viewAll, setViewAll] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

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

  const filteredObs = viewAll ? obs : obs.slice(0, previewCount);

  return (
    <>
      {speciesName && (
        <h3 className="text-sm font-bold mt-4">
          {speciesName} Reports&nbsp;
          <span className="text-gray-500 text-sm">({obs.length})</span>
        </h3>
      )}
      <table className="w-full text-[13px] mt-2">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left pl-1.5">Date</th>
            <th className="text-left">#</th>
            <th className="text-right"></th>
          </tr>
        </thead>
        <tbody>
          {filteredObs.map(({ date, count, checklistId }, index) => (
            <tr key={`${locId}-${speciesCode}-${index}`}>
              <td className="pl-1.5">{dayjs(date).format("MMM, D, YYYY")}</td>
              <td>{count}</td>
              <td className="text-right">
                <a href={`https://ebird.org/checklist/${checklistId}`} target="_blank" rel="noreferrer">
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
            View All
          </button>
        )}
      </p>
      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
    </>
  );
}
