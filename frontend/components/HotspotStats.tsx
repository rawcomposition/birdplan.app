import React from "react";
import dayjs from "dayjs";
import { dateTimeToRelative } from "lib/helpers";
import useFetchRecentChecklists from "hooks/useFetchRecentChecklists";

type Props = {
  id: string;
  speciesTotal?: number;
  checklistsTotal?: number;
};

export default function HotspotStats({ id, speciesTotal, checklistsTotal }: Props) {
  const { checklists } = useFetchRecentChecklists(id);

  const lastChecklistRow = checklists?.[0];
  const lastChecklistIsoDate = lastChecklistRow?.isoObsDate;
  const lastChecklistDate = lastChecklistRow?.obsDt;
  const lastChecklistTime = lastChecklistRow?.obsTime;
  const lastChecklistRegion =
    lastChecklistRow?.loc.subnational2Code ||
    lastChecklistRow?.loc.subnational1Code ||
    lastChecklistRow?.loc.countryCode ||
    "";
  const lastChecklist = lastChecklistIsoDate
    ? dateTimeToRelative(lastChecklistIsoDate, lastChecklistRegion).replace("months", "mo").replace("month", "mo")
    : "Never";

  return (
    <div className="flex gap-10 text-gray-500">
      <div className="flex flex-col text-success">
        <span className="text-3xl font-bold">{speciesTotal ?? "--"}</span>
        <span className="text-xs">Species</span>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-bold">{checklistsTotal?.toLocaleString() ?? "--"}</span>
        <span className="text-xs">Checklists</span>
      </div>
      <div className="flex flex-col">
        {lastChecklistDate ? (
          <span title={dayjs(`${lastChecklistDate} ${lastChecklistTime}`).format("MMMM D, YYYY h:mm A")}>
            <span className="text-3xl font-bold">{lastChecklist.split(" ")[0]}</span>{" "}
            <span className="text-lg font-bold">{lastChecklist.split(" ")[1]}</span>
          </span>
        ) : (
          <span className="text-3xl font-bold">--</span>
        )}
        <span className="text-xs">Last Checklist</span>
      </div>
    </div>
  );
}
