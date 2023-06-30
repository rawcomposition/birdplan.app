import React from "react";
import Expand from "components/Expand";
import SpeciesRow from "components/SpeciesRow";
import { RecentSpecies } from "lib/types";
import Search from "components/Search";

type Props = {
  recentSpecies: RecentSpecies[];
};

export default function RecentSpeciesSidebarBlock({ recentSpecies }: Props) {
  const [search, setSearch] = React.useState("");

  const filteredSpecies = recentSpecies.filter((it) => it.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Expand heading="Recent Needs" count={recentSpecies.length} focusInput>
      {recentSpecies.length > 0 && <Search value={search} onChange={setSearch} />}
      <ul className="divide-y divide-gray-800">
        {filteredSpecies.map(({ code, name }) => (
          <SpeciesRow key={code} name={name} code={code} />
        ))}
      </ul>
    </Expand>
  );
}
