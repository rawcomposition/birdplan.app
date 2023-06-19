import React from "react";
import toast from "react-hot-toast";

type Item = {
  locId: string;
  subId: string;
  userDisplayName: string;
  numSpecies: number;
  obsDt: string;
  obsTime: string;
  subID: string;
  loc: {
    locId: string;
    name: string;
    latitude: number;
    longitude: number;
    countryCode: string;
    countryName: string;
    subnational1Name: string;
    subnational1Code: string;
    subnational2Code: string;
    subnational2Name: string;
    isHotspot: boolean;
    locName: string;
    lat: number;
    lng: number;
    hierarchicalName: string;
    locID: string;
  };
};

export default function useFetchRecentChecklists(region?: string, count: number = 10) {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<Item[]>([]);

  React.useEffect(() => {
    if (!region) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://api.ebird.org/v2/product/lists/${region}?maxResults=${count}&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`
        );
        if (!res.ok) throw new Error();
        const data: Item[] = await res.json();
        setItems(data);
      } catch (error) {
        toast.error("Failed to fetch recent checklists");
      }
      setLoading(false);
    })();
  }, [region]);

  return { recentChecklists: items, loading };
}
