import React from "react";
import Expand from "components/Expand";
import SpeciesRow from "components/SpeciesRow";
import { RecentSpecies } from "lib/types";

type Props = {
  recentSpecies: RecentSpecies[];
};

export default function RecentSpeciesSidebarBlock({ recentSpecies }: Props) {
  const [search, setSearch] = React.useState("");

  const filteredSpecies = recentSpecies.filter((it) => it.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Expand heading="Recent Needs" count={recentSpecies.length} focusInput>
      {recentSpecies.length > 0 && (
        <input
          type="search"
          className="w-full px-2 py-[3px] text-gray-400/80 sm:text-[12px] bg-gray-800 rounded-md mb-2 focus:outline-none focus:border-gray-600/90 border border-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
        />
      )}
      <ul className="divide-y divide-gray-800">
        {filteredSpecies.map(({ code, name }) => (
          <SpeciesRow key={code} name={name} code={code} />
        ))}
      </ul>
    </Expand>
  );
}
