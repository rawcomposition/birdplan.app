import React from "react";
import { Header, Body } from "providers/modals";
import Button from "components/Button";
import Directions from "icons/Directions";
import { Hotspot as HotspotT } from "lib/types";

type Props = {
  hotspot: HotspotT;
  speciesCode: string;
};

export default function PersonalLocation({ hotspot, speciesCode }: Props) {
  const { name, lat, lng } = hotspot;
  return (
    <>
      <Header>
        {name}
        <br />
        <span className="text-xs text-gray-500">Personal Location</span>
      </Header>
      <Body>
        <div className="flex gap-2 mb-2">
          <Button
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            color="gray"
            size="sm"
          >
            <Directions className="mr-1 -mt-[3px] text-[#c2410d]" /> Directions
          </Button>
        </div>
      </Body>
    </>
  );
}
