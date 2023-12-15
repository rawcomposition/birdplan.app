import { useQuery } from "@tanstack/react-query";
import { useTrip } from "providers/trip";

type TargetImageT = {
  code: string;
  url: string;
};

export default function useTripTargetImages() {
  const { trip } = useTrip();
  const tripId = trip?.id;

  const { data } = useQuery<TargetImageT[]>([`/api/trips/${tripId}/target-images`], {
    enabled: !!tripId,
    meta: {
      errorMessage: "Failed to load hotspot targets",
    },
  });

  return data || [];
}
