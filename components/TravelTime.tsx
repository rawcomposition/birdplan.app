import { useTrip } from "providers/trip";
import Icon from "components/Icon";
import { formatTime, formatDistance } from "lib/helpers";
import { Menu } from "@headlessui/react";
import clsx from "clsx";

type Props = {
  isEditing: boolean;
  dayId: string;
  id: string;
  isLoading: boolean;
};

export default function TravelTime({ isEditing, dayId, id, isLoading }: Props) {
  const { trip, calcTravelTime, markTravelTimeDeleted } = useTrip();
  const locations = trip?.itinerary?.find((day) => day.id === dayId)?.locations || [];
  const thisLocationIndex = locations.findIndex((it) => it.id === id);
  const location1 = locations[thisLocationIndex - 1];
  const location2 = locations[thisLocationIndex]; // current location
  const travelData = location2?.travel;

  const calculate = async (method: "walking" | "driving" | "cycling") => {
    await calcTravelTime({
      dayId,
      id,
      locationId1: location1?.locationId,
      locationId2: location2?.locationId,
      method,
      save: true,
    });
  };

  const marker1 =
    trip?.hotspots?.find((h) => h.id === location1?.locationId || "") ||
    trip?.markers?.find((m) => m.id === location1?.locationId || "");

  const marker2 =
    trip?.hotspots?.find((h) => h.id === location2?.locationId || "") ||
    trip?.markers?.find((m) => m.id === location2?.locationId || "");

  const travelInfo = travelData && (
    <span className="flex items-center gap-2">
      {travelData.method === "walking" ? (
        <Icon name="walking" className="text-gray-400" />
      ) : travelData.method === "driving" ? (
        <Icon name="car" className="text-gray-400" />
      ) : (
        <Icon name="cycling" className="text-gray-400" />
      )}
      <span className="font-medium">{formatTime(travelData.time)}</span>•
      <span className="text-gray-500 text-xs">{formatDistance(travelData.distance, false)}</span>
    </span>
  );

  return (
    <div className="flex items-center gap-6 group">
      <div
        className={clsx(
          "border-l border-gray-300 border-dashed border-[1.1px] ml-4",
          isEditing || travelData ? "h-10" : "h-4"
        )}
      />

      {isEditing ? (
        <div className="flex items-center gap-2">
          <Menu as="div" className="text-gray-500 text-xs relative">
            <Menu.Button
              className={clsx(" cursor-pointer", !!travelData?.isDeleted && "hover:text-gray-700 hover:underline")}
            >
              {(!travelData || !!travelData?.isDeleted) && !isLoading && <>Calculate travel time</>}
              {isLoading && (!travelData || !!travelData?.isDeleted) && <>loading...</>}
              {!travelData?.isDeleted && travelInfo}
            </Menu.Button>
            <Menu.Items className="absolute text-sm -right-2 top-6 rounded bg-white shadow-lg py-1 w-[130px] ring-1 ring-black ring-opacity-5 flex flex-col z-10">
              <Menu.Item>
                <button
                  type="button"
                  onClick={() => calculate("walking")}
                  className="flex items-center gap-2 px-4 py-1.5 text-gray-600 hover:bg-gray-100"
                >
                  <Icon name="walking" /> Walk
                </button>
              </Menu.Item>
              <Menu.Item>
                <button
                  type="button"
                  onClick={() => calculate("driving")}
                  className="flex items-center gap-2 px-4 py-1.5 text-gray-600 hover:bg-gray-100"
                >
                  <Icon name="car" /> Drive
                </button>
              </Menu.Item>
              <Menu.Item>
                <button
                  type="button"
                  onClick={() => calculate("cycling")}
                  className="flex items-center gap-2 px-4 py-1.5 text-gray-600 hover:bg-gray-100"
                >
                  <Icon name="cycling" /> Bike
                </button>
              </Menu.Item>
            </Menu.Items>
          </Menu>
          {travelData && !travelData?.isDeleted && (
            <button
              type="button"
              onClick={() => markTravelTimeDeleted(dayId, id)}
              className="text-[16px] p-1 -mt-1.5 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Icon name="xMarkBold" />
            </button>
          )}
        </div>
      ) : (
        <a
          href={`https://www.google.com/maps/dir/?api=1&origin=${marker1?.lat},${marker1?.lng}&destination=${marker2?.lat},${marker2?.lng}&travelmode=${travelData?.method}`}
          target="_blank"
        >
          {!travelData?.isDeleted && <div className="text-gray-500 text-xs relative">{travelInfo}</div>}
        </a>
      )}
    </div>
  );
}
