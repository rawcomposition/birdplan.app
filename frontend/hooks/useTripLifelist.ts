import { Trip } from "@birdplan/shared";
import { useUser } from "hooks/useUser";

export type TripLifelist = {
  lifelist: string[];
  myLifelist: string[];
  isGroup: boolean;
  count: number;
};

export default function useTripLifelist(trip?: Trip | null): TripLifelist {
  const { lifelist: worldLifelist } = useUser();

  const lifelist = trip?.groupLifelist ?? trip?.tripLifelist ?? trip?.viewerLifelist ?? worldLifelist;
  const myLifelist = trip?.viewer?.listMode === "custom" ? trip?.viewerLifelist ?? worldLifelist : worldLifelist;
  const isGroup = trip?.isGroupTrip ?? false;

  return { lifelist, myLifelist, isGroup, count: lifelist.length };
}
