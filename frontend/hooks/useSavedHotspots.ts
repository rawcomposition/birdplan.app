import { useQuery } from "@tanstack/react-query";
import { SavedHotspot } from "@birdplan/shared";
import { useUser } from "hooks/useUser";

export const SAVED_HOTSPOTS_KEY = ["/saved-hotspots"];

export default function useSavedHotspots() {
  const { user } = useUser();

  const query = useQuery<SavedHotspot[]>({
    queryKey: SAVED_HOTSPOTS_KEY,
    enabled: !!user?._id,
  });

  return { ...query, savedHotspots: query.data || [] };
}
