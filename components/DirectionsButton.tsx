import React from "react";
import Button from "components/Button";
import Directions from "icons/Directions";
import SlideOver from "components/SlideOver";
import { useTrip } from "providers/trip";
import MarkerWithIcon from "components/MarkerWithIcon";
import Marker from "icons/Marker";
import Link from "next/link";
import { getMarkerColor } from "lib/helpers";

type Props = {
  lat: number;
  lng: number;
  hotspotId?: string;
  markerId?: string;
};

export default function DirectionsButton({ lat, lng, hotspotId, markerId }: Props) {
  const [open, setOpen] = React.useState(false);
  const { trip } = useTrip();

  const filteredHotspots = trip?.hotspots.filter((it) => it.id !== hotspotId) || [];
  const filteredMarkers = trip?.markers.filter((it) => it.id !== markerId) || [];

  const isDirect = filteredHotspots.length === 0 && filteredMarkers.length === 0;

  return (
    <>
      <Button
        onClick={isDirect ? null : () => setOpen(true)}
        target="_blank"
        color="gray"
        size="sm"
        href={isDirect ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : undefined}
      >
        <Directions className="mr-1 -mt-[3px] text-[#c2410d]" /> Directions
      </Button>
      <SlideOver open={open} onClose={() => setOpen(false)}>
        <Link
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          className="flex items-center gap-2 text-sm cursor-pointer pb-2 mb-2.5"
          target="_blank"
        >
          <Directions className="text-lg ml-3 mr-1.5 text-green-700" />
          View on Google Maps
        </Link>
        {(!!filteredHotspots?.length || !!filteredMarkers?.length) && (
          <>
            <h3 className="font-bold mb-1 -mt-1.5 text-sm">Directions from...</h3>
            <ul className="flex flex-col pl-2">
              {filteredMarkers.map((marker) => (
                <li key={marker.id}>
                  <Link
                    href={`https://www.google.com/maps/dir/?api=1&origin=${marker.lat},${marker.lng}&destination=${lat},${lng}`}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                    target="_blank"
                  >
                    <MarkerWithIcon showStroke={false} icon={marker.icon} className="inline-block ml-1 scale-75" />
                    <span className="truncate">{marker.name}</span>
                  </Link>
                </li>
              ))}
              {filteredHotspots.map((hotspot) => (
                <li key={hotspot.id}>
                  <Link
                    href={`https://www.google.com/maps/dir/?api=1&origin=${hotspot.lat},${hotspot.lng}&destination=${lat},${lng}`}
                    className="flex items-center gap-2 text-sm cursor-pointer py-0.5"
                    target="_blank"
                  >
                    <Marker className="h-8 w-8 scale-75 shrink-0" color={getMarkerColor(hotspot.species || 0)} />
                    <span className="truncate">{hotspot.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </SlideOver>
    </>
  );
}
