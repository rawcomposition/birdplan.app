import { LabelCreateInput } from "@birdplan/shared";
import { useTrip } from "hooks/useTrip";
import useTripMutation from "hooks/useTripMutation";

export default function useCreateTripLabel() {
  const { trip } = useTrip();

  return useTripMutation<LabelCreateInput>({
    url: `/trips/${trip?._id}/labels`,
    method: "POST",
    updateCache: (old, input) => ({ ...old, labels: [...(old.labels || []), input] }),
  });
}
