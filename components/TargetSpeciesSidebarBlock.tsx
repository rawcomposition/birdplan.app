import React from "react";
import Expand from "components/Expand";
import SpeciesRow from "components/SpeciesRow";
import { useTrip } from "providers/trip";
import useProfiles from "hooks/useProfiles";
import { useUser } from "providers/user";
import { Menu, Transition } from "@headlessui/react";
import AngleDown from "icons/AngleDown";

export default function TargetSpeciesSidebarBlock() {
  const [selectedUid, setSelectedUid] = React.useState("");
  const { targets, trip, invites } = useTrip();
  const { profiles } = useProfiles(trip?.userIds);
  const { user } = useUser();
  const myUid = user?.uid;
  const actualUid = selectedUid || myUid;

  const lifelist = profiles.find((it) => it.id === actualUid)?.lifelist || [];
  const targetSpecies = targets.filter((it) => !lifelist.includes(it.code)) || [];

  const inviteOptions = invites
    ?.filter(({ uid }) => !!uid)
    .map(({ name, email, uid }) => ({
      name: name || email,
      uid,
    }));

  const options = [
    {
      name: `${user?.displayName} (me)`,
      uid: myUid,
    },
    ...inviteOptions,
  ];

  const selectedOption = options.find((it) => it.uid === actualUid);

  return (
    <Expand heading="Target Species" className="text-white" count={targetSpecies.length}>
      {options.length > 1 && (
        <Menu as="div" className="mb-2.5 text-left relative">
          <div>
            <Menu.Button className="">
              <span className="text-gray-400/80 text-[12px]">Targets for</span>{" "}
              <span className="text-gray-300/90 text-[13px] hover:text-gray-200">
                {selectedOption?.name} <AngleDown />
              </span>
            </Menu.Button>
          </div>

          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute left-12 top-7 z-10 w-44 origin-top-left rounded-md bg-gray-800 shadow-lg ring-1 ring-gray-700 focus:outline-none">
              <div className="py-0.5">
                {options?.map(({ name, uid }) => (
                  <Menu.Item key={uid}>
                    <button
                      onClick={() => setSelectedUid(uid || "")}
                      className="w-full px-4 py-1 text-left text-[13px] hover:text-gray-300 text-gray-400"
                    >
                      {name}
                    </button>
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      )}
      <ul className="divide-y divide-gray-800 mb-2">
        {targetSpecies.map((target) => (
          <SpeciesRow key={target.code} {...target} />
        ))}
      </ul>
    </Expand>
  );
}
