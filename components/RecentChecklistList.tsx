import React from "react";
import dayjs from "dayjs";
import { dateTimeToRelative } from "lib/helpers";
import { useTrip } from "providers/trip";
import Link from "next/link";
import useFetchRecentChecklists from "hooks/useFetchRecentChecklists";
import useFetchHotspotObs from "hooks/useFetchHotspotObs";
import useFetchHotspotInfo from "hooks/useFetchHotspotInfo";
import Icon from "components/Icon";
import ObsList from "components/ObsList";
import FilterTabs from "components/FilterTabs";
import Alert from "components/Alert";

type Props = {
  hotspotId: string;
  speciesCode?: string;
  speciesName?: string;
};

export default function RecentChecklistList({ hotspotId, speciesCode, speciesName }: Props) {
  const [view, setView] = React.useState<string>("all");
  const [expanded, setExpanded] = React.useState(false);
  const { trip } = useTrip();
  const timezone = trip?.timezone;

  const { data: info } = useFetchHotspotInfo(trip?._id || "", hotspotId);
  const { groupedChecklists, isLoading, error, refetch } = useFetchRecentChecklists(hotspotId);
  const {
    data: obs,
    isLoading: isLoadingObs,
    error: obsError,
  } = useFetchHotspotObs(trip?._id || "", hotspotId, speciesCode);
  const checklists = expanded ? groupedChecklists : groupedChecklists.slice(0, 10);

  const successRate = info?.numChecklists && obs?.length ? obs.length / info.numChecklists : null;

  const reduceLoaders = !!speciesCode;

  return (
    <>
      {speciesCode && (
        <div className="text-sm -mx-1 my-1 bg-sky-100 text-sky-800 py-2.5 px-3 rounded">
          {speciesName}
          <br />
          {isLoadingObs && <Icon name="loading" className="text-xl animate-spin" />}
          {successRate && (
            <>
              <strong className="text-xl">{Math.round(successRate * 100)}%</strong> of{" "}
              {info?.numChecklists?.toLocaleString()} checklists
            </>
          )}
          {!!obsError && <span className="text-red-500">Failed to load recent reports</span>}
        </div>
      )}
      {speciesCode && (
        <FilterTabs
          className="my-4"
          value={view}
          onChange={setView}
          options={[
            { label: "All", value: "all" },
            { label: `${speciesName} Reports`, value: "obs" },
          ]}
        />
      )}
      {view === "obs" && speciesCode && <ObsList hotspotId={hotspotId} speciesCode={speciesCode} />}
      {view === "all" && (
        <>
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
                {checklists.map((checklists) => {
                  const checklist = checklists[0];
                  const { subId, numSpecies, obsDt, obsTime } = checklist;
                  const checklistIds = checklists.map((it) => it.subId);
                  const time = obsTime || "10:00";
                  const timestamp = dayjs(`${obsDt} ${time}`).format();
                  const hasObs = obs?.some((it) => checklistIds.includes(it.checklistId));
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
          {!expanded && groupedChecklists.length > 10 && (
            <button onClick={() => setExpanded(true)} className="block w-full text-sm text-center mt-2 text-blue-900">
              View more
            </button>
          )}
          {expanded && (
            <p className="text-sm mt-2 text-center">
              <Link
                target="_blank"
                className="text-sm text-blue-900 mt-2"
                href={`https://ebird.org/hotspot/${hotspotId}/activity?yr=all&m=`}
              >
                View more on eBird
              </Link>
            </p>
          )}
          {!isLoading && checklists.length === 0 && !error && (
            <Alert style="info" className="-mx-1 my-1">
              No recent checklists
            </Alert>
          )}
          {isLoading && (
            <Alert style="gray" className="-mx-1 my-1">
              {!reduceLoaders && <Icon name="loading" className="text-xl animate-spin" />}
              Loading recent checklists...
            </Alert>
          )}
          {error && (
            <Alert style="error" className="-mx-1 my-1">
              <Icon name="xMarkCircle" className="text-xl" />
              Failed to load recent checklists
              <button className="text-sky-600 font-medium" onClick={() => refetch()}>
                Retry
              </button>
            </Alert>
          )}
        </>
      )}
    </>
  );
}
