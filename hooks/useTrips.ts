import React from "react";
import { Trip } from "lib/types";
import { subscribeToTrips, deleteTrip as deleteDbTrip } from "lib/firebase";
import toast from "react-hot-toast";
import { useUser } from "providers/user";

export default function useTrip() {
  const [trips, setTrips] = React.useState<Trip[]>([]);
  const { user } = useUser();
  const uid = user?.uid;

  React.useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToTrips((trips) => setTrips(trips));
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

  return { trips, deleteTrip };
}
