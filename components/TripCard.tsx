import React from "react";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import { Trip } from "lib/types";
import Trash from "icons/Trash";
import VerticalDots from "icons/VerticalDots";

type Props = {
  trip: Trip;
  onDelete: (id: string) => void;
};

export default function TripCard({ trip, onDelete }: Props) {
  const { id, name, hotspots } = trip;

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onDelete(trip.id);
  };

  return (
    <Link href={`/${id}`}>
      <div className="bg-white rounded-lg shadow p-4 pt-3.5 relative">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 mb-2">{name}</h2>
        </div>
        <p className="text-sm text-gray-500">
          {hotspots.length} {hotspots.length === 1 ? "hotspot" : "hotspots"}
        </p>
        <Menu as="div" className="absolute top-1.5 right-1 inline-block text-left">
          <div>
            <Menu.Button className="flex items-center rounded-full p-3 text-gray-400 hover:text-gray-600">
              <span className="sr-only">Open options</span>
              <VerticalDots className="text-lg" aria-hidden="true" />
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
            <Menu.Items className="absolute right-0 z-10 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                  >
                    <Trash className="mr-2 text-red-700 text-[16px]" aria-hidden="true" />
                    <span>Delete Trip</span>
                  </button>
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </Link>
  );
}
