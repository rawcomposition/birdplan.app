import React from "react";
import Button from "components/Button";
import Directions from "icons/Directions";
import SlideOver from "components/SlideOver";
import { useTrip } from "providers/trip";
import MarkerWithIcon from "components/MarkerWithIcon";
import GoogleMaps from "icons/GoogleMaps";
import Link from "next/link";
import { MarkerIcon } from "lib/types";
import OrganicMaps from "icons/OrganicMaps";

type Props = {
  lat: number;
  lng: number;
  hotspotId?: string;
  markerId?: string;
  googleUrl?: string;
};

export default function DirectionsButton({ lat, lng, hotspotId, markerId, googleUrl }: Props) {
  const [open, setOpen] = React.useState(false);
  const { trip } = useTrip();

  const filteredHotspots = trip?.hotspots.filter((it) => it.id !== hotspotId) || [];
  const filteredMarkers = trip?.markers.filter((it) => it.id !== markerId) || [];
  const hotspot = trip?.hotspots.find((it) => it.id === hotspotId);

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
        <a
          href={googleUrl || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          className="flex items-center gap-2 text-sm cursor-pointer pb-2 mb-2.5 text-gray-700"
          target="_blank"
        >
          <GoogleMaps className="text-lg ml-3.5 mr-1.5 flex-shrink-0" />
          View in Google Maps
        </a>
        <a
          href={`om://map?v=1&ll=${lat},${lng}&n=${hotspot?.name || ""}`}
          className="flex items-center gap-2 text-sm cursor-pointer pb-2 mb-2.5 text-gray-700 sm:hidden"
          target="_blank"
        >
          <OrganicMaps className="text-lg ml-3.5 mr-1.5 flex-shrink-0" />
          View in Organic Maps
        </a>
        {(!!filteredHotspots?.length || !!filteredMarkers?.length) && (
          <>
            <h3 className="font-bold mb-1.5 -mt-1.5 text-sm">Directions from...</h3>
            <ul className="flex flex-col pl-2 space-y-0.5">
              {filteredMarkers.map((marker) => (
                <li key={marker.id}>
                  <Link
                    href={`https://www.google.com/maps/dir/?api=1&origin=${marker.lat},${marker.lng}&destination=${lat},${lng}`}
                    className="flex items-center gap-2 text-sm cursor-pointer text-gray-700"
                    target="_blank"
                  >
                    <MarkerWithIcon
                      showStroke={false}
                      icon={marker.icon}
                      className="inline-block ml-1 scale-75 flex-shrink-0"
                    />
                    <span className="truncate">{marker.name}</span>
                  </Link>
                </li>
              ))}
              {filteredHotspots.map((hotspot) => (
                <li key={hotspot.id}>
                  <Link
                    href={`https://www.google.com/maps/dir/?api=1&origin=${hotspot.lat},${hotspot.lng}&destination=${lat},${lng}`}
                    className="flex items-center gap-2 text-sm cursor-pointer py-0.5 text-gray-700"
                    target="_blank"
                  >
                    <MarkerWithIcon
                      showStroke={false}
                      icon={MarkerIcon.HOTSPOT}
                      className="inline-block ml-1 scale-75 flex-shrink-0"
                    />
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
