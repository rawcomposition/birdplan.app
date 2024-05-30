import React from "react";
import { Menu, Transition } from "@headlessui/react";
import { useTrip } from "providers/trip";
import { useUser } from "providers/user";
import Icon from "components/Icon";

type PropsT = {
  value?: string;
  onChange: (value: string) => void;
};

export default function ProfileSelect({ value, onChange }: PropsT) {
  const { invites, trip } = useTrip();
  const { user } = useUser();

  const options =
    trip?.userIds?.map((uid) => {
      const isMe = uid === user?.uid;
      const invite = invites?.find((it) => it.uid === uid);
      const name = isMe ? `${user?.displayName} (me)` || "Me" : invite?.name || invite?.email || `User ${uid}`;
      return { name, uid };
    }) || [];

  const selectedOption = options.find((it) => it.uid === value);

  if (options.length <= 1) return null;

  return (
    <Menu as="div" className="mt-1 ml-2 sm:ml-0 text-left relative sm:-mb-1">
      <div>
        <Menu.Button className="py-1 sm:py-0 sm:pt-2 ">
          <span className="text-gray-400 text-[12px]">Targets for</span>{" "}
          <span className="text-gray-600 text-[13px] hover:text-gray-600">
            {selectedOption?.name} <Icon name="angleDown" />
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
          <div className="py-2">
            {options?.map(({ name, uid }) => (
              <Menu.Item key={uid}>
                <button
                  onClick={() => onChange(uid || "")}
                  className="w-full px-4 py-1 text-left text-[13px] hover:text-gray-200 text-gray-300"
                >
                  {name}
                </button>
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
