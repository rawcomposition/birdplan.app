import React from "react";
import useFetchRecentChecklists from "hooks/useFetchRecentChecklists";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type Props = {
  id: string;
  speciesTotal?: number;
};

type Info = {
  checklists: number;
  species: number;
};

export default function Hotspot({ id, speciesTotal }: Props) {
  const [info, setInfo] = React.useState<Info>();
  const { recentChecklists } = useFetchRecentChecklists(id);

  const lastChecklistDate = recentChecklists[0]?.obsDt;
  const lastChecklistTime = recentChecklists[0]?.obsTime;
  const lastChecklist =
    lastChecklistDate && lastChecklistTime ? dayjs(`${lastChecklistDate} ${lastChecklistTime}`).fromNow() : "Never";

  const lastChecklistTrimmed = lastChecklist
    .replace(" ago", "")
    .replace("an ", "1 ")
    .replace("a ", "1 ")
    .replace("months", "mo")
    .replace("month", "mo");

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
          <span>
            <span className="text-3xl font-bold">{lastChecklistTrimmed.split(" ")[0]}</span>{" "}
            <span className="text-lg font-bold">{lastChecklistTrimmed.split(" ")[1]}</span>
          </span>
        ) : (
          <span className="text-3xl font-bold">--</span>
        )}
        <span className="text-xs">Last Checklist</span>
      </div>
    </div>
  );
}
