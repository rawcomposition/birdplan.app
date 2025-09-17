import React from "react";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { useModal } from "providers/modals";
import { useProfile } from "providers/profile";
import { useTrip } from "providers/trip";
import Icon from "components/Icon";

type Props = {
  className?: string;
};

export default function TripOptionsDropdown({ className }: Props) {
  const { open } = useModal();
  const { lifelist, uid } = useProfile();
  const { targets, trip, isOwner, canEdit } = useTrip();

  const links = [
    {
      name: !!lifelist?.length ? `Update Life List (${lifelist?.length?.toLocaleString()})` : "Import Life List",
      href: `/import-lifelist?tripId=${trip?._id}&back=true`,
      icon: "feather",
    },
    {
      name: !!targets?.items?.length ? "Update Targets" : "Import Targets",
      href: `/${trip?._id}/import-targets?redirect=targets&back=true`,
      icon: "bullseye",
      hidden: !canEdit,
    },
    {
      name: "Share Trip",
      onClick: () => open("share"),
      icon: "share",
      hidden: !isOwner,
    },
    {
      name: "Trip Settings",
      href: `/${trip?._id}/settings`,
      icon: "cog",
      hidden: !canEdit,
    },
    {
      name: "Export KML",
      href: `${process.env.NEXT_PUBLIC_API_URL}/trips/${trip?._id}/export?uid=${uid}`,
      icon: "export",
    },
  ];

  const filteredLinks = links.filter((it) => !it.hidden);

  return (
    <Menu as="div" className="relative z-20 ml-auto">
      <Menu.Button
        className={
          className ||
          "flex items-center text-[14px] gap-2 font-medium justify-center rounded py-1 px-1 hover:bg-slate-300 text-gray-600"
        }
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
          className="-right-2 top-9 absolute  z-50 min-w-[240px] origin-top-right ring-[0.5px] ring-gray-700/10 overflow-hidden rounded-lg bg-white text-gray-700 shadow-md py-2"
        >
          <Menu.Items>
            {filteredLinks.map(({ name, href, onClick, icon }) => (
              <Menu.Item key={name}>
                {({ active }) =>
                  onClick ? (
                    <button
                      type="button"
                      className="flex items-center gap-2 p-2 pl-4 text-[13px] text-gray-900 hover:bg-gray-50 w-full"
                      onClick={onClick}
                    >
                      <Icon name={icon as any} />
                      <span>{name}</span>
                    </button>
                  ) : (
                    <Link
                      className="flex items-center gap-2 p-2 pl-4 text-[13px] text-gray-900 hover:bg-gray-50"
                      href={href}
                    >
                      <Icon name={icon as any} />
                      <span>{name}</span>
                    </Link>
                  )
                }
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition.Child>
      </Transition>
    </Menu>
  );
}
