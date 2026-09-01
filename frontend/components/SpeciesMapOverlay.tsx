import React from "react";
import toast from "react-hot-toast";
import MapBox from "components/Mapbox";
import MapOverlay from "components/MapOverlay";
import SegmentedControl from "components/SegmentedControl";
import MapButton from "components/MapButton";
import Icon from "components/Icon";
import { useTrip } from "hooks/useTrip";
import { useModal } from "stores/modals";
import useFetchSpeciesObs from "hooks/useFetchSpeciesObs";
import useSpeciesHotspotRankings from "hooks/useSpeciesHotspotRankings";
import { buildFrequencyLayer, filterLayerToSaved } from "lib/helpers";
import { useMapPreferences } from "stores/mapPreferences";
import { Button } from "components/ui/button";

type MapMode = "trip" | "recent";

type Props = {
  onOutsideClick: (e: React.MouseEvent<HTMLElement>) => void;
};

export default function SpeciesMapOverlay({ onOutsideClick }: Props) {
  const { trip, selectedSpecies, setSelectedSpecies } = useTrip();
  const { open, modalId } = useModal();
  const [mode, setMode] = React.useState<MapMode>("trip");
  const [showInfo, setShowInfo] = React.useState(true);
  const showPersonalLocations = useMapPreferences((state) => state.showPersonalLocations);
  const setShowPersonalLocations = useMapPreferences((state) => state.setShowPersonalLocations);
  const savedHotspotsOnly = useMapPreferences((state) => state.savedHotspotsOnly);
  const setSavedHotspotsOnly = useMapPreferences((state) => state.setSavedHotspotsOnly);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !modalId) setSelectedSpecies(undefined);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalId, setSelectedSpecies]);

  const { obs, obsLayer } = useFetchSpeciesObs({ region: trip?.region, code: selectedSpecies?.code });
  const { hotspots } = useSpeciesHotspotRankings(selectedSpecies?.code);

  if (!selectedSpecies) return null;

  const savedIds = new Set(trip?.hotspots.map((it) => it.id) ?? []);
  const fullLayer = mode === "trip" ? buildFrequencyLayer(hotspots, savedIds) : obsLayer;
  const layer = savedHotspotsOnly ? filterLayerToSaved(fullLayer, savedIds) : fullLayer;

  const subtitle =
    mode === "trip"
      ? "Hotspots shaded by how often the species is reported during your trip dates."
      : "Reports from the last 30 days.";

  const handleClick = (id: string) => {
    const observation = obs.find((it) => it.id === id);
    const target = trip?.hotspots.find((it) => it.id === id) || observation || hotspots.find((it) => it.id === id);
    if (!target) return toast.error("Location not found");
    open(observation?.isPersonal ? "personalLocation" : "hotspot", {
      hotspot: target,
      speciesCode: selectedSpecies.code,
      speciesName: selectedSpecies.name,
    });
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col" onClick={onOutsideClick}>
      {showInfo && (
        <MapOverlay onClose={() => setShowInfo(false)} title={selectedSpecies.name}>
          {subtitle}{" "}
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
      )}
      <div className="w-full grow relative">
        {trip?.bounds && <MapBox key={trip._id} onHotspotClick={handleClick} obsLayer={layer} bounds={trip.bounds} />}
        <div className="absolute top-4 right-4 sm:left-4 sm:right-auto z-10 flex flex-col items-end sm:items-start gap-3">
          <MapButton onClick={() => setSelectedSpecies(undefined)} tooltip="Close map">
            <Icon name="xMark" />
          </MapButton>
          <SegmentedControl<MapMode>
            value={mode}
            onChange={setMode}
            options={[
              { value: "trip", label: "Trip dates" },
              { value: "recent", label: "Recent sightings" },
            ]}
          />
          <MapButton
            onClick={() => setSavedHotspotsOnly(!savedHotspotsOnly)}
            tooltip={savedHotspotsOnly ? "Show all hotspots" : "Show only saved hotspots"}
            active={savedHotspotsOnly}
          >
            <Icon name={savedHotspotsOnly ? "star" : "starOutline"} />
          </MapButton>
          {mode === "recent" && !savedHotspotsOnly && (
            <MapButton
              onClick={() => setShowPersonalLocations(!showPersonalLocations)}
              tooltip={showPersonalLocations ? "Hide personal locations" : "Show personal locations"}
              active={showPersonalLocations}
            >
              <Icon name="user" />
            </MapButton>
          )}
        </div>
      </div>
    </div>
  );
}
