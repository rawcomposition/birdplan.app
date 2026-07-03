import { Day } from "@birdplan/shared";

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
