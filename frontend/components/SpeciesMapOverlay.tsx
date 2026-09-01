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
import { buildFrequencyLayer, filterOutPersonal, frequencyColorIndex, markerColors } from "lib/helpers";
import MarkerWithIcon from "components/MarkerWithIcon";
import { useMapPreferences } from "stores/mapPreferences";
import { Button } from "components/ui/button";

type MapMode = "trip" | "recent";

type Props = {
  onOutsideClick: (e: React.MouseEvent<HTMLElement>) => void;
};

export default function SpeciesMapOverlay({ onOutsideClick }: Props) {
  const { trip, selectedSpecies, setSelectedSpecies } = useTrip();
  const { open } = useModal();
  const [mode, setMode] = React.useState<MapMode>("trip");
  const showPersonalLocations = useMapPreferences((state) => state.showPersonalLocations);
  const setShowPersonalLocations = useMapPreferences((state) => state.setShowPersonalLocations);
  const [savedHotspotsOnly, setSavedHotspotsOnly] = React.useState(false);
  const [prevCode, setPrevCode] = React.useState(selectedSpecies?.code);

  if (selectedSpecies?.code !== prevCode) {
    setPrevCode(selectedSpecies?.code);
    setSavedHotspotsOnly(false);
  }

  const savedHotspots = trip?.hotspots ?? [];
  const savedIds = new Set(savedHotspots.map((it) => it.id));

  const { obs, obsLayer } = useFetchSpeciesObs({ region: trip?.region, code: selectedSpecies?.code });
  const regionHotspots = useSpeciesHotspotRankings(selectedSpecies?.code);
  const savedRanked = useSpeciesHotspotRankings(
    mode === "trip" ? selectedSpecies?.code : undefined,
    savedHotspots.map((it) => it.id)
  );

  if (!selectedSpecies) return null;

  const savedFrequency = new Map(savedRanked.map((it) => [it.id, it.frequency]));
  const regionLayer = buildFrequencyLayer(regionHotspots, savedIds);
  const recentLayer = showPersonalLocations ? obsLayer : filterOutPersonal(obsLayer);
  const layer = savedHotspotsOnly ? null : mode === "trip" ? regionLayer : recentLayer;

  const reportedIds = new Set(obs.map((it) => it.id));

  const markers = savedHotspots.map((it) => {
    const frequency = savedFrequency.get(it.id);
    const hasDataForMode = mode === "trip" ? frequency != null : reportedIds.has(it.id);
    return {
      id: it.id,
      lat: it.lat,
      lng: it.lng,
      color: mode === "trip" ? markerColors[frequency == null ? 0 : frequencyColorIndex(frequency)] : undefined,
      faded: !hasDataForMode,
    };
  });

  const personalDisabled = mode === "trip" || savedHotspotsOnly;

  const subtitle =
    mode === "trip"
      ? "Hotspots shaded by how often the species is reported during your trip dates."
      : "Reports from the last 30 days.";

  const handleClick = (id: string) => {
    const observation = obs.find((it) => it.id === id);
    const target = savedHotspots.find((it) => it.id === id) || observation || regionHotspots.find((it) => it.id === id);
    if (!target) return toast.error("Location not found");
    open(observation?.isPersonal ? "personalLocation" : "hotspot", {
      hotspot: target,
      speciesCode: selectedSpecies.code,
      speciesName: selectedSpecies.name,
    });
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col" onClick={onOutsideClick}>
      <div className="w-full grow relative">
        {trip?.bounds && (
          <MapBox
            key={trip._id}
            onHotspotClick={handleClick}
            markers={markers}
            obsLayer={layer}
            bounds={trip.bounds}
          />
        )}
        <div className="absolute top-3 left-3 right-3 sm:right-auto sm:w-[26rem] z-10 flex flex-col items-start gap-3">
          <MapOverlay
            onClose={() => setSelectedSpecies(undefined)}
            closeVariant="back"
            title={selectedSpecies.name}
            className="relative left-0 top-0 w-full max-w-none translate-x-0"
          >
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
            <MarkerWithIcon icon="hotspot" showStroke={false} className="scale-[0.7]" />
          </MapButton>
          <MapButton
            onClick={() => setShowPersonalLocations(!showPersonalLocations)}
            tooltip={
              personalDisabled
                ? "Personal locations are only in recent sightings"
                : showPersonalLocations
                  ? "Hide personal locations"
                  : "Show personal locations"
            }
            active={showPersonalLocations && !personalDisabled}
            disabled={personalDisabled}
          >
            <Icon name="user" />
          </MapButton>
        </div>
      </div>
    </div>
  );
}
