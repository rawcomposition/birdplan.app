import React from "react";
import MarkerWithIcon from "components/MarkerWithIcon";
import { useTrip } from "providers/trip";
import { useHotspotTargets } from "providers/hotspot-targets";
import { useModal } from "providers/modals";
import clsx from "clsx";
import Search from "components/Search";
import CloseButton from "components/CloseButton";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function HotspotList({ isOpen, onClose }: Props) {
  const [hotspotSearch, setHotspotSearch] = React.useState("");
  const [markerSearch, setMarkerSearch] = React.useState("");
  const { open, close } = useModal();
  const { trip } = useTrip();
  const { allTargets } = useHotspotTargets();
  const hotspots = trip?.hotspots || [];
  const markers = trip?.markers || [];

  const filteredHotspots =
    hotspotSearch.length > 0
      ? hotspots.filter((hotspot) => hotspot.name.toLowerCase().includes(hotspotSearch.toLowerCase().trim()))
      : hotspots;

  const filteredMarkers =
    markerSearch.length > 0
      ? markers.filter((marker) => marker.name.toLowerCase().includes(markerSearch.toLowerCase().trim()))
      : markers;

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      !target.closest("button") &&
      !target.closest("a") &&
      !target.closest('[role="button"]') &&
      !target.closest("input")
    ) {
      close();
    }
  };

  return (
    <div
      className={clsx(
        "h-full flex relative flex-col w-full max-w-sm bg-white gap-4 pb-4 overflow-auto light-scrollbar",
        isOpen ? "block" : "hidden"
      )}
      onClick={handleContainerClick}
    >
      <CloseButton
        className="absolute z-20 top-2 right-2 sm:right-4 p-2 bg-gray-50 rounded-full"
        onClick={onClose}
        size="sm"
      />
      {filteredHotspots.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-4 mt-4 mb-2">
            <h2 className="text-lg font-medium">Hotspots</h2>
            <span className="bg-gray-200 rounded-md px-2 py-1 text-xs leading-none">{hotspots.length}</span>
          </div>
          <Search value={hotspotSearch} onChange={setHotspotSearch} className="mx-2" />
          <div className="flex flex-col divide-y divide-gray-100 -mt-1">
            {filteredHotspots.map((hotspot) => {
              const targetsCount = allTargets.find((it) => it.hotspotId === hotspot.id)?.items?.length;
              const hasTargets = !!targetsCount;
              return (
                <button
                  key={hotspot.id}
                  className="py-3 cursor-pointer hover:bg-gray-50 text-left px-4"
                  onClick={() => open("hotspot", { hotspot })}
                >
                  <span className="flex items-start gap-2">
                    <MarkerWithIcon
                      showStroke={false}
                      icon="hotspot"
                      className="inline-block scale-[0.65] flex-shrink-0"
                    />
                    <span className="flex flex-col">
                      <span className="text-sm">{hotspot.name}</span>
                      {hasTargets && <span className="text-xs text-gray-500">{targetsCount} targets</span>}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {filteredMarkers.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-4 mt-4 mb-1">
            <h2 className="text-lg font-medium">Custom Locations</h2>
            <span className="bg-gray-200 rounded-md px-2 py-1 text-xs leading-none">{markers.length}</span>
          </div>
          <Search value={markerSearch} onChange={setMarkerSearch} className="mx-2" />
          <div className="flex flex-col divide-y divide-gray-100 -mt-1">
            {filteredMarkers.map((marker) => (
              <button
                key={marker.id}
                className="py-3 cursor-pointer hover:bg-gray-50 text-left px-4"
                onClick={() => open("viewMarker", { marker })}
              >
                <span className="flex items-center gap-2">
                  <MarkerWithIcon
                    showStroke={false}
                    icon={marker.icon}
                    className="inline-block scale-[0.65] flex-shrink-0"
                  />
                  <span className="flex flex-col">{marker.name}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
