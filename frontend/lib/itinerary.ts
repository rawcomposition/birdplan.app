import { Day, Trip } from "@birdplan/shared";
import dayjs from "dayjs";

export const getTripDays = (trip?: Trip | null): Day[] => {
  const persisted = trip?.itinerary || [];
  if (!trip?.startDate || !trip?.endDate) return persisted;
  const dayCount = dayjs(trip.endDate).diff(dayjs(trip.startDate), "day") + 1;
  return Array.from({ length: dayCount }, (_, i) => persisted[i] || { id: `${trip._id}-d${i}`, locations: [] });
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
