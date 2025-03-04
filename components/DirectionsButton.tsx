import React from "react";
import Button from "components/Button";
import SlideOver from "components/SlideOver";
import { useTrip } from "providers/trip";
import MarkerWithIcon from "components/MarkerWithIcon";
import Link from "next/link";
import Icon from "components/Icon";
import OrganicMapsIcon from "components/OrganicMapsIcon";
import GoogleMapsIcon from "components/GoogleMapsIcon";
import { defaultMarkerIcon } from "lib/icons";
import { LocationType } from "lib/types";

type Props = {
  locationId: string;
  lat: number;
  lng: number;
  googleUrl?: string;
};

export default function DirectionsButton({ locationId, lat, lng, googleUrl }: Props) {
  const [open, setOpen] = React.useState(false);
  const { locations } = useTrip();

  const filteredHotspots = locations.filter((it) => it._id !== locationId && it.type === LocationType.hotspot) || [];
  const filteredMarkers = locations.filter((it) => it._id !== locationId && it.type === LocationType.custom) || [];
  const location = locations.find((it) => it._id === locationId);

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
        <Icon name="directions" className="mr-1 -mt-[3px] text-[#c2410d]" /> Directions
      </Button>
      <SlideOver open={open} onClose={() => setOpen(false)}>
        <a
          href={googleUrl || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          className="flex items-center gap-2 text-sm cursor-pointer pb-2 mb-2.5 text-gray-700"
          target="_blank"
        >
          <GoogleMapsIcon className="text-lg ml-3.5 mr-1.5 flex-shrink-0" />
          View in Google Maps
        </a>
        <a
          href={`om://map?v=1&ll=${lat},${lng}&n=${location?.name || ""}`}
          className="flex items-center gap-2 text-sm cursor-pointer pb-2 mb-2.5 text-gray-700 sm:hidden"
          target="_blank"
        >
          <OrganicMapsIcon className="text-lg ml-3.5 mr-1.5 flex-shrink-0" />
          View in Organic Maps
        </a>
        {(!!filteredHotspots?.length || !!filteredMarkers?.length) && (
          <>
            <h3 className="font-bold mb-1.5 -mt-1.5 text-sm">Directions from...</h3>
            <ul className="flex flex-col pl-2 space-y-0.5">
              {filteredMarkers.map((marker) => (
                <li key={marker._id}>
                  <Link
                    href={`https://www.google.com/maps/dir/?api=1&origin=${marker.lat},${marker.lng}&destination=${lat},${lng}`}
                    className="flex items-center gap-2 text-sm cursor-pointer text-gray-700"
                    target="_blank"
                  >
                    <MarkerWithIcon
                      showStroke={false}
                      icon={marker.icon || defaultMarkerIcon}
                      className="inline-block ml-1 scale-75 flex-shrink-0"
                    />
                    <span className="truncate">{marker.name}</span>
                  </Link>
                </li>
              ))}
              {filteredHotspots.map((hotspot) => (
                <li key={hotspot._id}>
                  <Link
                    href={`https://www.google.com/maps/dir/?api=1&origin=${hotspot.lat},${hotspot.lng}&destination=${lat},${lng}`}
                    className="flex items-center gap-2 text-sm cursor-pointer py-0.5 text-gray-700"
                    target="_blank"
                  >
                    <MarkerWithIcon
                      showStroke={false}
                      icon="hotspot"
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
