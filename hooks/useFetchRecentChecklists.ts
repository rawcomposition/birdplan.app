import React from "react";
import toast from "react-hot-toast";
import { RecentChecklist } from "lib/types";

export default function useFetchRecentChecklists(region?: string, count: number = 10) {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<RecentChecklist[]>([]);

  React.useEffect(() => {
    if (!region) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://api.ebird.org/v2/product/lists/${region}?maxResults=${count}&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`
        );
        if (!res.ok) throw new Error();
        const data: RecentChecklist[] = await res.json();
        setItems(data);
      } catch (error) {
        toast.error("Failed to fetch recent checklists");
      }
      setLoading(false);
    })();
  }, [region, count]);

  return { recentChecklists: items, loading };
}
