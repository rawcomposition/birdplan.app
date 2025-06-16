import { mostFrequentValue } from "lib/helpers";
import { getTravelTime } from "lib/mapbox";
import { Day, Trip as TripType } from "@birdplan/shared";

export const updateDayTravelTimes = async (trip: TripType, day: Day) => {
  if (!trip) throw new Error("Trip is required for updating travel times");
  if (!day) throw new Error("Day is required for updating travel times");
  const existingMethods = day.locations?.map((it) => it.travel?.method || null) || [];
  const defaultMethod = mostFrequentValue(existingMethods) as "walking" | "driving" | "cycling" | null;
  const otherTravelData = await getAllTravelData(trip.itinerary, day);

  try {
    const promises = day.locations?.map(async ({ travel, ...it }, index) => {
      const fromLocation = day.locations[index - 1];
      // First location in the day
      if (!fromLocation) return it;

      const fromId = fromLocation.locationId;
      const toId = it.locationId;
      const method = travel?.method || defaultMethod || "driving";
      if (!fromId || !toId || !method) return it;

      // Two of the same locations in a row
      if (fromLocation.locationId == it.locationId) {
        return {
          ...it,
          travel: {
            distance: 0,
            time: 0,
            method,
            locationId: fromId,
          },
        };
      }

      // Matches other travel data
      const otherData = otherTravelData.find((d) => d.fromId == fromId && d.toId == toId && d.method == method);
      if (otherData) {
        return {
          ...it,
          travel: {
            distance: otherData.distance,
            time: otherData.time,
            method,
            locationId: fromId,
          },
        };
      }

      // Calculate travel time between two locations
      const from = trip.hotspots?.find((h) => h.id === fromId) || trip.markers?.find((m) => m.id === fromId);
      const to = trip.hotspots?.find((h) => h.id === toId) || trip.markers?.find((m) => m.id === toId);
      if (!from || !to) return it;

      console.log(`Calculating travel time from ${from.name} to ${to.name}`);
      const { lat: lat1, lng: lng1 } = from;
      const { lat: lat2, lng: lng2 } = to;

      try {
        const data = await getTravelTime({ method, lat1, lng1, lat2, lng2 });
        if (!data || !data.distance || !data.time) throw new Error("No data");
        const travelData = {
          distance: data.distance,
          time: data.time,
          method,
          locationId: fromId,
        };
        return { ...it, travel: travelData };
      } catch (e) {
        return it;
      }
    });
    const results = await Promise.all(promises || []);
    return { ...day, locations: results };
  } catch (error) {
    console.error("Error updating travel times:", error);
    return day;
  }
};

type TravelDataRef = {
  fromId: string;
  toId: string;
  method: "walking" | "driving" | "cycling";
  distance: number;
  time: number;
};

const getAllTravelData = async (itinerary: TripType["itinerary"], updatedDay?: Day) => {
  if (!itinerary) return [];
  const travelData: TravelDataRef[] = [];
  for (const day of itinerary) {
    const locations = updatedDay && day.id == updatedDay.id ? updatedDay.locations : day.locations;
    for (const location of locations) {
      if (
        location.travel &&
        location.travel.locationId &&
        location.locationId &&
        location.travel.method &&
        location.travel.distance &&
        location.travel.time
      ) {
        travelData.push({
          fromId: location.travel.locationId,
          toId: location.locationId,
          method: location.travel.method,
          distance: location.travel.distance,
          time: location.travel.time,
        });
      }
    }
  }
  return travelData;
};

export const removeInvalidTravelData = (locations: Day["locations"]) => {
  return (
    locations?.map(({ travel, ...it }, index) => {
      const prev = index > 0 ? locations[index - 1] : null;
      if (!prev || !travel) return it;
      if (travel.locationId !== prev.locationId) return it;
      return { ...it, travel };
    }) || []
  );
};

export const moveLocation = (locations: Day["locations"], id: string, direction: "up" | "down") => {
  if (!locations) return [];
  const locationIndex = locations.findIndex((it) => it.id === id);
  const location = locations.splice(locationIndex, 1)[0];
  const newIndex = direction === "up" ? locationIndex - 1 : locationIndex + 1;
  locations.splice(newIndex, 0, location);
  return locations;
};
