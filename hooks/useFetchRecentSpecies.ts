import React from "react";
import toast from "react-hot-toast";
import { useProfile } from "providers/profile";

type Item = {
  code: string;
  name: string;
  date: string;
};

export default function useFetchRecentSpecies(region: string) {
  const [items, setItems] = React.useState<Item[]>([]);
  const { lifelist } = useProfile();

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/region-species?region=${region}`);
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
