import { Trip } from "@birdplan/shared";
import useTripLifelist from "hooks/useTripLifelist";
import { useTargetPreferencesStore, TargetView } from "stores/targetPreferences";

export type UseTargetView = {
  view: TargetView;
  setView: (view: TargetView) => void;
  canChoose: boolean;
  lifelist: string[];
};

export default function useTargetView(trip?: Trip | null): UseTargetView {
  const { lifelist: groupLifelist, myLifelist, isGroup } = useTripLifelist(trip);
  const tripId = trip?._id;
  const stored = useTargetPreferencesStore((state) => (tripId ? state.viewByTrip[tripId] : undefined));
  const setStored = useTargetPreferencesStore((state) => state.setView);

  const canChoose = isGroup && !!trip?.viewer;
  const view: TargetView = canChoose ? stored ?? "group" : "group";
  const setView = (next: TargetView) => tripId && setStored(tripId, next);
  const lifelist = view === "mine" ? myLifelist : groupLifelist;

  return { view, setView, canChoose, lifelist };
}
