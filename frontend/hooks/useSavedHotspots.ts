import { useQuery } from "@tanstack/react-query";
import { SavedHotspot } from "@birdplan/shared";
import { useUser } from "hooks/useUser";

export default function useSavedHotspots() {
  const { user } = useUser();

  const query = useQuery<SavedHotspot[]>({
    queryKey: ["/saved-hotspots"],
    enabled: !!user?._id,
  });

  return { ...query, savedHotspots: query.data || [] };
}
