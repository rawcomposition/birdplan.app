import React from "react";
import MapBox from "components/Mapbox";
import { useModal } from "stores/modals";
import useFetchHotspots from "hooks/useFetchHotspots";
import { getMarkerColorIndex } from "lib/helpers";
import toast from "react-hot-toast";
import { useTrip } from "hooks/useTrip";
import MapButton from "components/MapButton";
import MapOverlay from "components/MapOverlay";
import Icon from "components/Icon";
import { Star, Utensils, MapPin } from "lucide-react";
import { Button } from "components/ui/button";

export default function Trip() {
  const { open } = useModal();
  const { trip, canEdit, setSelectedSpecies, showAllHotspots, setShowAllHotspots, showSatellite, setShowSatellite } =
    useTrip();
  const [isAddingMarker, setIsAddingMarker] = React.useState(false);

  const savedHotspots = trip?.hotspots || [];
  const { hotspots, hotspotLayer } = useFetchHotspots();

  const savedHotspotMarkers = savedHotspots.map((it) => ({
    lat: it.lat,
    lng: it.lng,
    shade: getMarkerColorIndex(it.species || 0),
    id: it.id,
  }));

  const markers = [...savedHotspotMarkers];
  const customMarkers = trip?.markers || [];

  const hotspotClick = (id: string) => {
    setSelectedSpecies(undefined);
    const allHotspots = hotspots.length > 0 ? hotspots : savedHotspots;
    const hotspot = allHotspots.find((it) => it.id === id);
    if (!hotspot) return toast.error("Hotspot not found");
    open("hotspot", { hotspot });
  };

  const tripIsLoaded = !!trip;
  const tripIsNew = trip?.hotspots.length === 0;

  React.useEffect(() => {
    if (tripIsLoaded && tripIsNew) {
      setShowAllHotspots(true);
    }
  }, [tripIsLoaded, tripIsNew]);

  return (
    <>
      {trip && <title>{`${trip.name} | BirdPlan.app`}</title>}
      <div className="absolute top-4 right-4 sm:left-4 sm:right-auto flex flex-col gap-3 z-10">
        <MapButton
          onClick={() => setShowAllHotspots((prev) => !prev)}
          tooltip={showAllHotspots ? "Hide hotspots" : "Show hotspots"}
          active={showAllHotspots}
        >
          <Icon name="mapFlatPin" />
        </MapButton>
        <MapButton onClick={() => setShowSatellite((prev) => !prev)} tooltip="Satellite view" active={showSatellite}>
          <Icon name="layers" />
        </MapButton>
        {canEdit && (
          <MapButton
            onClick={() => setIsAddingMarker((prev) => !prev)}
            tooltip={isAddingMarker ? "Cancel add marker" : "Add location"}
            active={isAddingMarker}
            childItems={[
              {
                label: "eBird Hotspot",
                onClick: () => open("addHotspot"),
                icon: <Star />,
              },
              {
                label: "Place",
                onClick: () => open("addPlace"),
                icon: <Utensils />,
              },
              {
                label: "Custom",
                onClick: () => setIsAddingMarker((prev) => !prev),
                icon: <MapPin />,
              },
            ]}
          >
            <Icon name="markerPlus" />
          </MapButton>
        )}
      </div>
      <div className="h-full grow flex sm:relative flex-col w-full">
        <div className="w-full grow relative">
          {trip?.bounds && (
            <MapBox
              key={trip._id}
              onHotspotClick={hotspotClick}
              markers={markers}
              customMarkers={customMarkers}
              hotspotLayer={showAllHotspots && hotspotLayer}
              bounds={trip.bounds}
              addingMarker={isAddingMarker}
              onDisableAddingMarker={() => setIsAddingMarker(false)}
              showSatellite={showSatellite}
            />
          )}
          {isAddingMarker && (
            <MapOverlay onClose={() => setIsAddingMarker(false)} title="Click to add marker">
              or{" "}
              <Button
                className="underline"
                variant="link"
                size="sm"
                onClick={() => {
                  setIsAddingMarker(false);
                  open("addMarker");
                }}
              >
                enter coordinates
              </Button>
            </MapOverlay>
          )}
        </div>
      </div>
    </>
  );
}
