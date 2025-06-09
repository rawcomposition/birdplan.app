import React from "react";
import { Header, Body } from "providers/modals";
import { Hotspot as HotspotT } from "lib/types";
import ObsList from "components/ObsList";
import DirectionsButton from "components/DirectionsButton";
import { Menu } from "@headlessui/react";
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
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="text-[14px] rounded text-gray-600 bg-gray-100 px-2 py-[10px] inline-flex items-center">
              <Icon name="verticalDots" />
            </Menu.Button>
            <Menu.Items className="absolute text-sm -right-2 top-10 rounded bg-white shadow-lg px-4 py-2 w-[170px] ring-1 ring-black ring-opacity-5 flex flex-col gap-1">
              <Menu.Item>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-600"
                >
                  View on Google Maps
                </a>
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
        {speciesCode && <ObsList hotspotId={id} speciesCode={speciesCode} />}
      </Body>
    </>
  );
}
