import React from "react";
import { Header, Body } from "providers/modals";
import Button from "components/Button";
import Directions from "icons/Directions";
import { Hotspot as HotspotT } from "lib/types";
import ObsList from "components/ObsList";
import DirectionsButton from "components/DirectionsButton";

type Props = {
  hotspot: HotspotT;
  speciesCode: string;
  speciesName: string;
};

export default function PersonalLocation({ hotspot, speciesCode, speciesName }: Props) {
  const { id, name, lat, lng } = hotspot;
  return (
    <>
      <Header>
        {name}
        <br />
        <span className="text-xs text-gray-500">Personal Location</span>
      </Header>
      <Body className="relative">
        <div className="flex gap-2 mb-2">
          <DirectionsButton lat={lat} lng={lng} />
        </div>
        {speciesCode && <ObsList locId={id} speciesCode={speciesCode} speciesName={speciesName} />}
      </Body>
    </>
  );
}
