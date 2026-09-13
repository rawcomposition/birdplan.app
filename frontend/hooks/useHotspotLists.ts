import { useQuery } from "@tanstack/react-query";
import { HotspotList } from "@birdplan/shared";
import { useUser } from "hooks/useUser";

export const HOTSPOT_LISTS_KEY = ["/hotspot-lists"];

export default function useHotspotLists() {
  const { user } = useUser();

  const query = useQuery<HotspotList[]>({
    queryKey: HOTSPOT_LISTS_KEY,
    enabled: !!user?._id,
  });

  return { ...query, lists: query.data || [] };
}
