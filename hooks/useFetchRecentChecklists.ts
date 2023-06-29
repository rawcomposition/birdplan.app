import React from "react";
import toast from "react-hot-toast";
import { RecentChecklist } from "lib/types";
import { randomId } from "lib/helpers";

export default function useFetchRecentChecklists(region?: string, count: number = 10) {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<RecentChecklist[]>([]);

  const groupedItems = React.useMemo(() => {
    const grouped = items.reduce((acc, item) => {
      const key = `${item.obsDt}-${item.obsTime || randomId(5)}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as { [key: string]: RecentChecklist[] });
    return Object.values(grouped);
  }, [items]);

  const groupedChecklistIds = groupedItems.map((group) => group.map((item) => item.subId)).slice(0, count);
  const uniqueItems = groupedItems.map((group) => group[0]).slice(0, count);

  React.useEffect(() => {
    if (!region) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://api.ebird.org/v2/product/lists/${region}?maxResults=${count * 2}&key=${
            process.env.NEXT_PUBLIC_EBIRD_KEY
          }`
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

  return { allChecklists: items, recentChecklists: uniqueItems, loading, groupedChecklistIds };
}
