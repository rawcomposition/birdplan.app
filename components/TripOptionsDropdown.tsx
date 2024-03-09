import React from "react";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import clsx from "clsx";
import VerticalDots from "icons/VerticalDots";
import Feather from "icons/Feather";
import Bullseye from "icons/Bullseye";
import Pencil from "icons/Pencil";
import ShareIcon from "icons/Share";
import ExportIcon from "icons/Export";
import Trash from "icons/Trash";
import { useModal } from "providers/modals";
import { deleteTrip } from "lib/firebase";
import { useProfile } from "providers/profile";
import { useTrip } from "providers/trip";

type Props = {
  className?: string;
  children?: React.ReactNode;
  dropUp?: boolean;
};

export default function TripOptionsDropdown({ className, children, dropUp }: Props) {
  const { open } = useModal();
  const { lifelist, id } = useProfile();
  const { targets, trip, isOwner } = useTrip();

  const links = [
    {
      name: !!lifelist?.length ? `Update Life List (${lifelist?.length?.toLocaleString()})` : "Import Life List",
      href: `/import-lifelist?tripId=${trip?.id}&back=true`,
      icon: <Feather />,
    },
    {
      name: !!targets?.items?.length ? "Update Targets" : "Import Targets",
      href: `/${trip?.id}/import-targets?redirect=targets&back=true`,
      icon: <Bullseye />,
    },
    {
      name: "Rename Trip",
      onClick: () => open("renameTrip", { trip }),
      icon: <Pencil />,
    },
    {
      name: "Share Trip",
      onClick: () => open("share"),
      icon: <ShareIcon />,
      hidden: !isOwner,
    },
    {
      name: "Export KML",
      href: `/api/trips/${trip?.id}/export?profileId=${id}`,
      icon: <ExportIcon />,
    },
    {
      name: "Export KML",
      onClick: () => window.open(`/api/trips/${trip?.id}/export?profileId=${id}`, "_blank"),
      icon: <ExportIcon />,
    },
    {
      name: "Delete Trip",
      onClick: () => {
        if (!trip) return;
        if (confirm("Are you sure you want to delete this trip?")) {
          deleteTrip(trip.id);
        }
      },
      icon: <Trash />,
    },
  ];

  const filteredLinks = links.filter((it) => !it.hidden);

  return (
    <Menu as="div" className="relative z-20 ml-auto">
      <Menu.Button
        className={
          className ||
          "flex items-center text-[14px] gap-2 font-medium justify-center rounded py-1 px-1 hover:bg-white/10 text-gray-300"
        }
      >
        <VerticalDots className="text-lg" />
      </Menu.Button>

      <Transition>
        <Transition.Child
          enter="transition duration-200 ease-out"
          enterFrom="scale-95 opacity-0"
          enterTo="scale-100 opacity-100"
          leave="transition duration-150 ease-in"
          leaveFrom="scale-100 opacity-100"
          leaveTo="scale-95 opacity-0"
          className={clsx(
            dropUp ? "bottom-24 right-4" : "-right-2 top-11 ",
            "absolute  z-50 min-w-[240px] origin-top-right ring-[0.5px] ring-gray-700/10 overflow-hidden rounded-lg bg-white text-gray-700 shadow-md py-2"
          )}
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
                      {icon}
                      <span>{name}</span>
                    </button>
                  ) : (
                    <Link
                      className="flex items-center gap-2 p-2 pl-4 text-[13px] text-gray-900 hover:bg-gray-50"
                      href={href}
                    >
                      {icon}
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
