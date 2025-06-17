type TravelTimeProps = {
  method: "driving" | "walking" | "cycling";
  lat1: number;
  lng1: number;
  lat2: number;
  lng2: number;
};

const get = async (url: string, params: Record<string, any>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  const response = await fetch(`${url}?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const getTravelTime = async ({ method, lat1, lng1, lat2, lng2 }: TravelTimeProps) => {
  try {
    const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/${method}/${lng1},${lat1};${lng2},${lat2}`;
    const response = await get(url, {
      sources: 0,
      annotations: "duration,distance",
      access_token: process.env.MAPBOX_SERVER_KEY || "",
    });
    const duration = response?.durations[0][1];
    const distance = response?.distances[0][1];

    if (!duration || !distance) {
      return null;
    }
    return { time: (duration as number) / 60, distance: distance as number };
  } catch (error) {
    console.log("Error getting travel time", error);
    return null;
  }
};
