import React from "react";
import { Menu, Transition } from "@headlessui/react";
import clsx from "clsx";
import Icon from "components/Icon";

export type ParticipantMenuItem = {
  name: string;
  icon: string;
  onClick: () => void;
  danger?: boolean;
};

type Props = {
  items: ParticipantMenuItem[];
};

export default function ParticipantOptionsDropdown({ items }: Props) {
  if (!items.length) return null;

  return (
    <Menu as="div" className="relative shrink-0">
      <Menu.Button
        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        title="Options"
      >
        <Icon name="verticalDots" className="text-lg" />
      </Menu.Button>

      <Transition>
        <Transition.Child
          as="div"
          enter="transition duration-200 ease-out"
          enterFrom="scale-95 opacity-0"
          enterTo="scale-100 opacity-100"
          leave="transition duration-150 ease-in"
          leaveFrom="scale-100 opacity-100"
          leaveTo="scale-95 opacity-0"
          className="right-0 top-9 absolute z-50 min-w-[200px] origin-top-right ring-[0.5px] ring-gray-700/10 overflow-hidden rounded-lg bg-white text-gray-700 shadow-md py-2"
        >
          <Menu.Items>
            {items.map(({ name, icon, onClick, danger }) => (
              <Menu.Item key={name}>
                <button
                  type="button"
                  onClick={onClick}
                  className={clsx(
                    "flex w-full items-center gap-2 p-2 pl-4 text-[13px] hover:bg-gray-50",
                    danger ? "text-red-600" : "text-gray-900"
                  )}
                >
                  <Icon name={icon as any} />
                  <span>{name}</span>
                </button>
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition.Child>
      </Transition>
    </Menu>
  );
}
