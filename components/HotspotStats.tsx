import React from "react";
import dayjs from "dayjs";
import { dateTimeToRelative } from "lib/helpers";
import { useTrip } from "providers/trip";
import useFetchRecentChecklists from "hooks/useFetchRecentChecklists";
import useFetchHotspotInfo from "hooks/useFetchHotspotInfo";

type Props = {
  id: string;
  speciesTotal?: number;
};

export default function HotspotStats({ id, speciesTotal }: Props) {
  const { checklists } = useFetchRecentChecklists(id);
  const { trip } = useTrip();
  const { data } = useFetchHotspotInfo(trip?._id || "", id);
  const timezone = trip?.timezone;

  const lastChecklistIsoDate = checklists?.[0]?.isoObsDate;
  const lastChecklistDate = checklists?.[0]?.obsDt;
  const lastChecklistTime = checklists?.[0]?.obsTime;
  const lastChecklist = lastChecklistIsoDate
    ? dateTimeToRelative(lastChecklistIsoDate, timezone).replace("months", "mo").replace("month", "mo")
    : "Never";

  return (
    <div className="flex gap-10 text-gray-500">
      <div className="flex flex-col text-[#1c6900]">
        <span className="text-3xl font-bold">{speciesTotal || data?.numSpecies || "--"}</span>
        <span className="text-xs">Species</span>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-bold">{data?.numChecklists?.toLocaleString() || "--"}</span>
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
