import React from "react";
import { buttonVariants } from "components/ui/button";
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxSeparator,
} from "components/ui/combobox";
import { useTrip } from "hooks/useTrip";
import MarkerWithIcon from "components/MarkerWithIcon";
import Icon from "components/Icon";
import OrganicMapsIcon from "components/OrganicMapsIcon";
import GoogleMapsIcon from "components/GoogleMapsIcon";
import { MarkerIconT } from "lib/icons";

type Props = {
  lat: number;
  lng: number;
  hotspotId?: string;
  markerId?: string;
  googleUrl?: string;
};

type Origin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  icon: MarkerIconT | "hotspot";
};

export default function DirectionsButton({ lat, lng, hotspotId, markerId, googleUrl }: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const { trip } = useTrip();

  const hotspot = trip?.hotspots.find((it) => it.id === hotspotId);

  const origins: Origin[] = [
    ...(trip?.markers
      .filter((it) => it.id !== markerId)
      .map((m) => ({ id: m.id, name: m.name, lat: m.lat, lng: m.lng, icon: m.icon as MarkerIconT })) ?? []),
    ...(trip?.hotspots
      .filter((it) => it.id !== hotspotId)
      .map((h) => ({ id: h.id, name: h.name, lat: h.lat, lng: h.lng, icon: "hotspot" as const })) ?? []),
  ];

  const googleSearchUrl = googleUrl || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  if (origins.length === 0) {
    return (
      <a
        href={googleSearchUrl}
        target="_blank"
        className={buttonVariants({ variant: "outline-white", size: "sm" })}
      >
        <Icon name="directions" className="text-[#c2410d]" /> Directions
      </a>
    );
  }

  return (
    <Combobox<Origin>
      items={origins}
      itemToStringLabel={(origin) => origin.name}
      autoHighlight
      value={null}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
      inputValue={query}
      onInputValueChange={setQuery}
      onValueChange={(origin) => {
        if (!origin) return;
        window.open(
          `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${lat},${lng}`,
          "_blank"
        );
        setOpen(false);
      }}
    >
      <ComboboxTrigger className={buttonVariants({ variant: "outline-white", size: "sm" })}>
        <Icon name="directions" className="text-[#c2410d]" /> Directions
      </ComboboxTrigger>
      <ComboboxContent>
        <a
          href={googleSearchUrl}
          target="_blank"
          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-gray-700 hover:bg-accent"
        >
          <GoogleMapsIcon className="ml-0.5 shrink-0 text-lg" /> View in Google Maps
        </a>
        <a
          href={`om://map?v=1&ll=${lat},${lng}&n=${hotspot?.name || ""}`}
          target="_blank"
          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-gray-700 hover:bg-accent sm:hidden"
        >
          <OrganicMapsIcon className="ml-0.5 shrink-0 text-lg" /> View in Organic Maps
        </a>
        <ComboboxSeparator />
        <ComboboxInput placeholder="Directions from..." />
        <ComboboxList>
          {(origin: Origin) => (
            <ComboboxItem key={origin.id} value={origin}>
              <MarkerWithIcon
                showStroke={false}
                icon={origin.icon as MarkerIconT}
                className="inline-block shrink-0 scale-75"
              />
              <span className="truncate">{origin.name}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No matching locations</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
