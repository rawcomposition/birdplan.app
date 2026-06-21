import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Trip } from "@birdplan/shared";
import useTripLifelist from "hooks/useTripLifelist";
import { lifelistToCsv } from "lib/lifelistCsv";

export default function useDownloadGroupLifelist(trip?: Trip | null) {
  const { isGroup, lifelist } = useTripLifelist(trip);

  const { data: taxonomy } = useQuery<
    { name: string; sciName: string; code: string }[]
  >({
    queryKey: ["/taxonomy?sciName=1"],
    enabled: isGroup,
  });

  const download = () => {
    if (!taxonomy) {
      toast.error("Taxonomy is still loading, please try again");
      return;
    }
    const byCode = new Map(taxonomy.map((it) => [it.code, it]));
    const species = lifelist
      .map((code) => byCode.get(code))
      .filter((it): it is NonNullable<typeof it> => !!it)
      .map((it) => ({ comName: it.name, sciName: it.sciName }));
    const csv = lifelistToCsv(species);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${trip?.name ? `${trip.name}-` : ""}group-life-list.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return { isGroup, download };
}
