import React from "react";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import { Trip } from "lib/types";
import Trash from "icons/Trash";
import Pencil from "icons/Pencil";
import VerticalDots from "icons/VerticalDots";
import { useModal } from "providers/modals";
import { images } from "../images";

type Props = {
  trip: Trip;
  onDelete: (id: string) => void;
};

export default function TripCard({ trip, onDelete }: Props) {
  const { open } = useModal();
  const { id, name, hotspots, region } = trip;
  const regionPieces = region.split(",")[0]?.split("-");
  const stateCode = regionPieces.length >= 2 ? `${regionPieces[0]}-${regionPieces[1]}` : null;
  const countryCode = regionPieces[0];

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onDelete(trip.id);
  };

  const handleRename = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    open("renameTrip", { trip });
  };

  const imageId = images[stateCode as keyof typeof images] || images[countryCode as keyof typeof images];

  return (
    <Link href={`/${id}`}>
      <div className="bg-white rounded-lg shadow relative p-4">
        <img
          src={
            imageId
              ? `https://cdn.download.ams.birds.cornell.edu/api/v1/asset/${imageId}/640`
              : `https://source.unsplash.com/d2uHXWTkGn4/600`
          }
          className="w-full h-36 object-cover rounded-lg mb-3 object-[0_20%]"
          alt=""
        />
        <div className="relative ">
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
                      onClick={handleRename}
                      className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                    >
                      <Pencil className="mr-2" aria-hidden="true" />
                      <span>Rename</span>
                    </button>
                  </Menu.Item>
                  <Menu.Item>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-100 text-red-700 hover:text-red-900"
                    >
                      <Trash className="mr-2" aria-hidden="true" />
                      <span>Delete Trip</span>
                    </button>
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </Link>
  );
}
