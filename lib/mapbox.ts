import { get } from "lib/helpers";
import toast from "react-hot-toast";

type TravelTimeProps = {
  method: "driving" | "walking" | "cycling";
  lat1: number;
  lng1: number;
  lat2: number;
  lng2: number;
};

// Returns duration in minutes and distance in meters
export const getTravelTime = async ({ method, lat1, lng1, lat2, lng2 }: TravelTimeProps) => {
  const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/${method}/${lng1},${lat1};${lng2},${lat2}`;
  const response = await get(url, {
    sources: 0,
    annotations: "duration,distance",
    access_token: process.env.NEXT_PUBLIC_MAPBOX_KEY || "",
  });
  const duration = response?.durations[0][1];
  const distance = response?.distances[0][1];

  if (!duration || !distance) {
    toast.error("Error getting travel time");
    return null;
  }
  return { time: (duration as number) / 60, distance: distance as number };
};
