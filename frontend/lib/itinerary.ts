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

export const moveLocation = (locations: Day["locations"], id: string, direction: "up" | "down") => {
  if (!locations) return [];
  const locationIndex = locations.findIndex((it) => it.id === id);
  const location = locations.splice(locationIndex, 1)[0];
  const newIndex = direction === "up" ? locationIndex - 1 : locationIndex + 1;
  locations.splice(newIndex, 0, location);
  return locations;
};
