import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "hooks/useUser";

export const HIDDEN_HOTSPOTS_KEY = ["/hidden-hotspots"];

export default function useHiddenHotspots() {
  const { user } = useUser();

  const query = useQuery<string[]>({
    queryKey: HIDDEN_HOTSPOTS_KEY,
    enabled: !!user?._id,
  });

  const hiddenIds = React.useMemo(() => new Set(query.data || []), [query.data]);

  return { ...query, hiddenIds };
}
