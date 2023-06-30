import React from "react";
import { Trip } from "lib/types";
import { subscribeToTrips, deleteTrip as deleteDbTrip } from "lib/firebase";
import toast from "react-hot-toast";
import { useUser } from "providers/user";
import { useLocalStorage } from "usehooks-ts";

export default function useTrip() {
  const [loading, setLoading] = React.useState(true);
  const [trips, setTrips] = useLocalStorage<Trip[]>("trips", []);
  const { user } = useUser();
  const uid = user?.uid;

  React.useEffect(() => {
    if (!uid) return;
    if (trips.length > 0) setLoading(false);
    const unsubscribe = subscribeToTrips((trips) => {
      setTrips(trips);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [uid]);

  const deleteTrip = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await deleteDbTrip(id);
      setTrips((prev) => prev.filter((trip) => trip.id !== id));
      toast.success("Trip deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete trip");
    }
  };

  return { trips, loading, deleteTrip };
}
