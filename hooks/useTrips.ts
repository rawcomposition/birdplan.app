import React from "react";
import dayjs from "dayjs";
import { Trip } from "lib/types";
import { getTrips, deleteTrip as deleteDbTrip } from "lib/firebase";
import toast from "react-hot-toast";
import { useUser } from "providers/user";

export default function useTrip() {
  const [trips, setTrips] = React.useState<Trip[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useUser();
  const uid = user?.uid;

  React.useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const results = await getTrips();
        setTrips(results);
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch trips");
      }
    })();
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
