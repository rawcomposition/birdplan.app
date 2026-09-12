import { useQuery } from "@tanstack/react-query";
import { Label } from "@birdplan/shared";
import { useUser } from "hooks/useUser";

export const LABELS_KEY = ["/labels"];

export default function useLabels() {
  const { user } = useUser();

  const query = useQuery<Label[]>({
    queryKey: LABELS_KEY,
    enabled: !!user?._id,
  });

  return { ...query, labels: query.data || [] };
}
