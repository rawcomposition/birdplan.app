import { getTravelTime } from "lib/mapbox";
import { useTrip } from "providers/trip";
import toast from "react-hot-toast";
import Walking from "icons/Walking";
import Car from "icons/Car";
import Cycling from "icons/Cycling";
import { formatTime, formatDistance } from "lib/helpers";
import { Menu } from "@headlessui/react";
import clsx from "clsx";

type Props = {
  isEditing: boolean;
  dayId: string;
  locationId: string;
};

// TODO: Reset travel time when location is removed or moved

export default function TravelTime({ isEditing, dayId, locationId }: Props) {
  const { trip, saveItineraryTravelData } = useTrip();
  const locations = trip?.itinerary?.find((day) => day.id === dayId)?.locations || [];
  const thisLocationIndex = locations.findIndex((it) => it.locationId === locationId);
  const location1 = locations[thisLocationIndex - 1];
  const location2 = locations[thisLocationIndex]; // current location
  const travelData = location2?.travel;

  const marker1 =
    trip?.hotspots?.find((h) => h.id === location1?.locationId || "") ||
    trip?.markers?.find((m) => m.id === location1?.locationId || "");

  const marker2 =
    trip?.hotspots?.find((h) => h.id === location2?.locationId || "") ||
    trip?.markers?.find((m) => m.id === location2?.locationId || "");

  const handleClick = async (method: "walking" | "driving" | "cycling") => {
    if (!marker1 || !marker2) {
      toast.error("Unable to calculate travel time");
      return;
    }
    const { lat: lat1, lng: lng1 } = marker1;
    const { lat: lat2, lng: lng2 } = marker2;
    const data = await getTravelTime({ method, lat1, lng1, lat2, lng2 });
    if (!data) {
      toast.error("Unable to calculate travel time");
      return;
    }
    saveItineraryTravelData(dayId, locationId, {
      distance: data.distance,
      time: data.time,
      method,
      locationId: location1?.locationId,
    });
  };

  const travelInfo = travelData && (
    <span className="flex items-center gap-2">
      {travelData.method === "walking" ? (
        <Walking className="text-gray-400" />
      ) : travelData.method === "driving" ? (
        <Car className="text-gray-400" />
      ) : (
        <Cycling className="text-gray-400" />
      )}
      <span className="font-medium">{formatTime(travelData.time)}</span>•
      <span className="text-gray-500 text-xs">{formatDistance(travelData.distance, false)}</span>
    </span>
  );

  return (
    <div className="flex items-center gap-6">
      <div
        className={clsx(
          "border-l border-gray-300 border-dashed border-[1.1px] ml-4",
          isEditing || travelData ? "h-10" : "h-4"
        )}
      />

      {isEditing ? (
        <Menu as="div" className="text-gray-500 text-xs relative">
          <Menu.Button
            className={clsx(" cursor-pointer", !travelData && isEditing && "hover:text-gray-700 hover:underline")}
          >
            {!travelData && isEditing && <>Calculate travel time</>}
            {travelInfo}
          </Menu.Button>
          <Menu.Items className="absolute text-sm -right-2 top-6 rounded bg-white shadow-lg py-1 w-[130px] ring-1 ring-black ring-opacity-5 flex flex-col z-10">
            <Menu.Item>
              <button
                type="button"
                onClick={() => handleClick("walking")}
                className="flex items-center gap-2 px-4 py-1.5 text-gray-600 hover:bg-gray-100"
              >
                <Walking /> Walk
              </button>
            </Menu.Item>
            <Menu.Item>
              <button
                type="button"
                onClick={() => handleClick("driving")}
                className="flex items-center gap-2 px-4 py-1.5 text-gray-600 hover:bg-gray-100"
              >
                <Car /> Drive
              </button>
            </Menu.Item>
            <Menu.Item>
              <button
                type="button"
                onClick={() => handleClick("cycling")}
                className="flex items-center gap-2 px-4 py-1.5 text-gray-600 hover:bg-gray-100"
              >
                <Cycling /> Bike
              </button>
            </Menu.Item>
          </Menu.Items>
        </Menu>
      ) : (
        <div className="text-gray-500 text-xs relative">{travelInfo}</div>
      )}
    </div>
  );
}
