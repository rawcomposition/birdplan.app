import React from "react";
import { RecentChecklist } from "lib/types";
import dayjs from "dayjs";
import { dateTimeToRelative } from "lib/helpers";
import { useTrip } from "providers/trip";

type Props = {
  id: string;
  speciesTotal?: number;
  checklists: RecentChecklist[];
};

type Info = {
  checklists: number;
  species: number;
};

export default function Hotspot({ id, speciesTotal, checklists }: Props) {
  const [info, setInfo] = React.useState<Info>();
  const { trip } = useTrip();
  const timezone = trip?.timezone;

  const lastChecklistDate = checklists[0]?.obsDt;
  const lastChecklistTime = checklists[0]?.obsTime;
  const lastChecklist =
    lastChecklistDate && lastChecklistTime
      ? dateTimeToRelative(`${lastChecklistDate} ${lastChecklistTime}`, timezone)
          .replace("months", "mo")
          .replace("month", "mo")
      : "Never";

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/hotspot-info?id=${id}`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        setInfo({ checklists: json.numChecklists, species: json.numSpecies });
      } catch (err) {
        console.log(err);
      }
    })();
  }, [id]);

  return (
    <div className="flex gap-10 text-gray-500">
      <div className="flex flex-col text-[#1c6900]">
        <span className="text-3xl font-bold">{speciesTotal || info?.species || "--"}</span>
        <span className="text-xs">Species</span>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-bold">{info?.checklists?.toLocaleString() || "--"}</span>
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
