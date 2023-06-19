import React from "react";
import toast from "react-hot-toast";
import { useProfile } from "providers/profile";

type Item = {
  code: string;
  name: string;
  date: string;
  checklistId: string;
  count: number;
};

export default function useFetchRecentSpecies(region?: string) {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<Item[]>([]);
  const { lifelist } = useProfile();

  React.useEffect(() => {
    if (!region) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/region-species?region=${region}`);
        if (!res.ok) throw new Error();
        const data: Item[] = await res.json();
        setItems(data);
      } catch (error) {
        toast.error("Failed to fetch recent species");
      }
      setLoading(false);
    })();
  }, [region]);

  const filtered = items.filter((it) => !lifelist.includes(it.code));

  return { recentSpecies: filtered, loading };
}
