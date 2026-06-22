import React from "react";
import { Header, Body } from "providers/modals";
import { Hotspot as HotspotT } from "@birdplan/shared";
import ObsList from "components/ObsList";
import DirectionsButton from "components/DirectionsButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import Icon from "components/Icon";
import { useTrip } from "providers/trip";

type Props = {
  hotspot: HotspotT;
  speciesCode: string;
};

export default function PersonalLocation({ hotspot, speciesCode }: Props) {
  const { setHalo } = useTrip();
  const { id, name, lat, lng } = hotspot;

  React.useEffect(() => {
    setHalo({ lat, lng, color: "#555" });
    return () => setHalo(undefined);
  }, [lat, lng]);

  return (
    <>
      <Header>
        {name}
        <br />
        <span className="text-xs text-gray-500">Personal Location</span>
      </Header>
      <Body className="relative min-h-[240px]">
        <div className="flex gap-2 mb-2">
          <DirectionsButton lat={lat} lng={lng} />
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center rounded bg-gray-100 px-2 py-[10px] text-[14px] text-gray-600">
              <Icon name="verticalDots" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[170px]">
              <DropdownMenuItem
                render={
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                View on Google Maps
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {speciesCode && <ObsList hotspotId={id} speciesCode={speciesCode} />}
      </Body>
    </>
  );
}
