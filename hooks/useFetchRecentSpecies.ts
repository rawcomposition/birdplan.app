import React from "react";
import toast from "react-hot-toast";

type Item = {
  code: string;
  name: string;
  date: string;
};

export default function useFetchRecentSpecies(lifelist: string[], region?: string) {
  const [items, setItems] = React.useState<Item[]>([]);

  React.useEffect(() => {
    if (!region) return;
    (async () => {
      try {
        const res = await fetch(`/api/region-species?region=${region}`);
        if (!res.ok) throw new Error();
        const data: Item[] = await res.json();
        setItems(data);
      } catch (error) {
        toast.error("Failed to fetch recent species");
      }
    })();
  }, [region]);

  const filtered = items.filter((it) => !lifelist.includes(it.code));

  return { recentSpecies: filtered };
}
