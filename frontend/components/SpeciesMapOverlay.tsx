import React from "react";
import MapBox from "components/Mapbox";
import MapOverlay from "components/MapOverlay";
import { useTrip } from "hooks/useTrip";
import { Button } from "components/ui/button";

type Props = {
  onOutsideClick: (e: React.MouseEvent<HTMLElement>) => void;
  onHotspotClick: (id: string) => void;
  obsLayer: React.ComponentProps<typeof MapBox>["obsLayer"];
};

export default function SpeciesMapOverlay({ onOutsideClick, onHotspotClick, obsLayer }: Props) {
  const { trip, selectedSpecies, setSelectedSpecies } = useTrip();
  if (!selectedSpecies) return null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col" onClick={onOutsideClick}>
      <MapOverlay onClose={() => setSelectedSpecies(undefined)} title={selectedSpecies.name}>
        Showing reports over the last 30 days.{" "}
        <Button
          className="underline"
          variant="link"
          size="sm"
          href={`https://ebird.org/map/${selectedSpecies.code}?env.minX=${trip?.bounds?.minX}&env.minY=${trip?.bounds?.minY}&env.maxX=${trip?.bounds?.maxX}&env.maxY=${trip?.bounds?.maxY}`}
          target="_blank"
        >
          View on eBird
        </Button>
      </MapOverlay>
      <div className="w-full grow relative">
        {trip?.bounds && (
          <MapBox key={trip._id} onHotspotClick={onHotspotClick} obsLayer={obsLayer} bounds={trip.bounds} />
        )}
      </div>
    </div>
  );
}
