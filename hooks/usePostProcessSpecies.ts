import { Species, RBAItem } from "lib/types";

type Props = {
  species: Species[];
  expanded: string[];
  seen: string[];
  pending: string[];
  showSeen: boolean;
};

export default function usePostProcessSpecies({ species, expanded, seen, pending, showSeen }: Props) {
  if (!species) {
    return { seenCount: 0, filteredSpecies: null };
  }
  let filteredSpecies: RBAItem[] = species.map((species) => ({
    ...species,
    isSeen: seen?.includes(species.code),
    isPending: pending?.includes(species.code),
    isExpanded: expanded.includes(species.code),
  }));

  const seenCount = filteredSpecies.filter(({ isSeen }) => !!isSeen).length;

  if (!showSeen) {
    filteredSpecies = filteredSpecies.filter(({ isSeen }) => !isSeen);
  }

  return { seenCount, filteredSpecies };
}
