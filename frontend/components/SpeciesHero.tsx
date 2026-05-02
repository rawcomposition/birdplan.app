import React from "react";
import clsx from "clsx";
import { Menu, Transition } from "@headlessui/react";
import Icon from "components/Icon";
import MonthlyFrequencyChart from "components/MonthlyFrequencyChart";

type Props = {
  name: string;
  scientificName?: string;
  photoUrl?: string;
  photoBy?: string;
  ebirdUrl: string;
  starred: boolean;
  seen: boolean;
  canEdit: boolean;
  monthly: number[];
  startMonth?: number;
  endMonth?: number;
  onToggleStar: () => void;
  onMarkSeen: () => void;
  onShowMap: () => void;
};

export default function SpeciesHero({
  name,
  scientificName,
  photoUrl,
  photoBy,
  ebirdUrl,
  starred,
  seen,
  canEdit,
  monthly,
  startMonth,
  endMonth,
  onToggleStar,
  onMarkSeen,
  onShowMap,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col sm:flex-row">
      <div
        className="bg-gray-100 sm:w-[360px] sm:flex-shrink-0 aspect-[4/3] sm:self-start bg-cover bg-center"
        style={photoUrl ? { backgroundImage: `url(${photoUrl})` } : undefined}
        title={photoBy ? `Photo by ${photoBy}` : undefined}
      >
        {!photoUrl && <div className="w-full h-full bg-gray-200" />}
      </div>

      <div className="flex-1 p-5 sm:px-6 sm:py-5 flex flex-col gap-4 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">{name}</h1>
              {starred && <Icon name="star" className="text-yellow-500 text-lg" />}
              {seen && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                  <Icon name="check" className="text-[10px]" />
                  Seen
                </span>
              )}
            </div>
            {scientificName && <div className="italic text-gray-600 text-sm mt-1">{scientificName}</div>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onShowMap}
              className="h-9 px-4 rounded-lg bg-gray-800 text-white hover:bg-gray-900 text-sm font-semibold inline-flex items-center gap-1.5"
            >
              <Icon name="map" className="text-sm" />
              View Map
            </button>
            <Menu as="div" className="relative">
              <Menu.Button
                className="h-9 w-9 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 grid place-items-center"
                aria-label="More actions"
              >
                <Icon name="verticalDots" className="text-base" />
              </Menu.Button>
              <Transition
                enter="transition duration-150 ease-out"
                enterFrom="scale-95 opacity-0"
                enterTo="scale-100 opacity-100"
                leave="transition duration-100 ease-in"
                leaveFrom="scale-100 opacity-100"
                leaveTo="scale-95 opacity-0"
              >
                <Menu.Items className="absolute right-0 top-10 z-30 min-w-[220px] origin-top-right ring-[0.5px] ring-gray-700/10 overflow-hidden rounded-lg bg-white shadow-md py-1.5">
                  <Menu.Item disabled={!canEdit}>
                    {({ active, disabled }) => (
                      <button
                        type="button"
                        onClick={onToggleStar}
                        disabled={disabled}
                        className={clsx(
                          "flex items-center gap-2.5 px-4 py-2 text-[13px] w-full text-left",
                          active ? "bg-gray-50 text-gray-900" : "text-gray-800",
                          disabled && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <Icon
                          name={starred ? "star" : "starOutline"}
                          className={starred ? "text-yellow-500" : "text-gray-500"}
                        />
                        {starred ? "Remove star" : "Star species"}
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href={ebirdUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={clsx(
                          "flex items-center gap-2.5 px-4 py-2 text-[13px]",
                          active ? "bg-gray-50 text-gray-900" : "text-gray-800"
                        )}
                      >
                        <Icon name="external" className="text-gray-500" />
                        View on eBird
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item disabled={!canEdit || seen}>
                    {({ active, disabled }) => (
                      <button
                        type="button"
                        onClick={onMarkSeen}
                        disabled={disabled}
                        className={clsx(
                          "flex items-center gap-2.5 px-4 py-2 text-[13px] w-full text-left",
                          active ? "bg-gray-50 text-gray-900" : "text-gray-800",
                          disabled && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <Icon name="check" className={seen ? "text-green-600" : "text-gray-500"} />
                        {seen ? "Marked as seen" : "Mark as seen"}
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>

        <MonthlyFrequencyChart monthly={monthly} startMonth={startMonth} endMonth={endMonth} className="mt-auto" />
      </div>
    </div>
  );
}
