import React from "react";
import Expand from "components/Expand";
import SpeciesRow from "components/SpeciesRow";
import { RecentSpecies } from "lib/types";
import Search from "components/Search";
import dayjs from "dayjs";
import { useTrip } from "providers/trip";

type Props = {
  recentSpecies: RecentSpecies[];
};

export default function RecentSpeciesSidebarBlock({ recentSpecies }: Props) {
  const [search, setSearch] = React.useState("");
  const { trip } = useTrip();
  const tz = trip?.timezone;

  const filteredSpecies = recentSpecies.filter((it) => it.name.toLowerCase().includes(search.toLowerCase()));

  const today = dayjs().tz(tz).format("YYYY-MM-DD");
  const yesterday = dayjs().tz(tz).subtract(1, "day").format("YYYY-MM-DD");
  let todayUsed = false;
  let yesterdayUsed = false;
  let olderUsed = false;

  return (
    <Expand heading="Recent Needs" count={recentSpecies.length} focusInput>
      {recentSpecies.length > 0 && <Search value={search} onChange={setSearch} />}
      <ul className="divide-y divide-gray-800">
        {filteredSpecies.map(({ code, name, date }) => {
          const dateFormatted = dayjs(date).tz(tz).format("YYYY-MM-DD");

          let showToday = false;
          let showYesterday = false;
          let showOlder = false;

          if (dateFormatted === today) {
            if (!todayUsed) {
              showToday = true;
              todayUsed = true;
            }
          } else if (dateFormatted === yesterday) {
            if (!yesterdayUsed) {
              yesterdayUsed = true;
              showYesterday = true;
            }
          } else {
            if (!olderUsed) {
              olderUsed = true;
              showOlder = true;
            }
          }
          return (
            <>
              {showToday && <li className="text-xs text-gray-500 py-1 pt-4">Today</li>}
              {showYesterday && <li className="text-xs text-gray-500 py-1 pt-4">Yesterday</li>}
              {showOlder && (todayUsed || yesterdayUsed) && <li className="text-xs text-gray-500 py-1 pt-4">Older</li>}
              <SpeciesRow key={code} name={name} code={code} />
            </>
          );
        })}
      </ul>
    </Expand>
  );
}
