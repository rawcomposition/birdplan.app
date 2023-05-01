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

  return (
    <>
      <Button onClick={() => setOpen(true)} target="_blank" color="gray" size="sm">
        <Directions className="mr-1 -mt-[3px] text-[#c2410d]" /> Directions
      </Button>
      <SlideOver open={open} onClose={() => setOpen(false)}>
        <h3 className="font-bold mb-2">Directions from...</h3>
        <ul className="flex flex-col pl-2">
          <li>
            <Link
              href={`https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${lat},${lng}`}
              className="flex items-center gap-2 text-sm cursor-pointer pb-2 pt-1.5"
              target="_blank"
            >
              <span className="w-2.5 h-2.5 bg-sky-600 rounded-full ring-4 ring-sky-600/20 ml-2.5 mr-2" />
              Current Location
            </Link>
          </li>
          {filteredMarkers.map((marker) => (
            <li key={marker.id}>
              <Link
                href={`https://www.google.com/maps/dir/?api=1&origin=${marker.lat},${marker.lng}&destination=${lat},${lng}`}
                className="flex items-center gap-2 text-sm cursor-pointer"
                target="_blank"
              >
                <MarkerWithIcon
                  showStroke={false}
                  offset={false}
                  icon={marker.icon}
                  className="inline-block ml-1 scale-75"
                />
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
      </SlideOver>
    </>
  );
}
