import MarkerWithIcon from "components/MarkerWithIcon";
import { useTrip } from "providers/trip";
import { useHotspotTargets } from "providers/hotspot-targets";
import { useModal } from "providers/modals";
import clsx from "clsx";

type Props = {
  isOpen: boolean;
};

export default function HotspotList({ isOpen }: Props) {
  const { open } = useModal();
  const { trip } = useTrip();
  const { allTargets } = useHotspotTargets();
  const hotspots = trip?.hotspots || [];
  const markers = trip?.markers || [];

  return (
    <div
      className={clsx(
        "h-full flex sm:relative flex-col w-full max-w-sm bg-white gap-4 py-4 overflow-auto light-scrollbar",
        isOpen ? "block" : "hidden"
      )}
    >
      {hotspots.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-4">
            <h2 className="text-lg font-medium">Hotspots</h2>
            <span className="bg-gray-200 rounded-md px-2 py-1 text-xs leading-none">{hotspots.length}</span>
          </div>
          <div className="flex flex-col divide-y divide-gray-100">
            {hotspots.map((hotspot) => {
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
      {markers.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-4">
            <h2 className="text-lg font-medium">Custom Locations</h2>
            <span className="bg-gray-200 rounded-md px-2 py-1 text-xs leading-none">{markers.length}</span>
          </div>
          <div className="flex flex-col divide-y divide-gray-100">
            {markers.map((marker) => (
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
