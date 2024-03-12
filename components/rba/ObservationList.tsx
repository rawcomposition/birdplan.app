import { truncate } from "lib/helpers";
import Timeago from "components/Timeago";
import Icon from "components/Icon";
import { RareObservation } from "lib/types";

type Props = {
  items: RareObservation[];
  userLat?: number;
  userLng?: number;
};

export default function ObservationList({ userLat, userLng, items }: Props) {
  return (
    <ul className="pl-4 pr-4 pb-4 flex flex-col gap-7 mt-3">
      {items?.map(
        ({
          locName,
          subnational2Name,
          subnational1Name,
          subId,
          obsId,
          obsDt,
          userDisplayName,
          lat,
          lng,
          distance,
          isClosest,
          hasRichMedia,
        }) => (
          <li key={obsId + userDisplayName} className="rounded-sm bg-white">
            <div className="flex items-start">
              <h4 className="text-slate-700 text-[0.85em] mr-auto">
                {truncate(locName, 45)}, {subnational2Name}, {subnational1Name}
              </h4>
              {isClosest && <span className="bg-lime-600 rounded-sm ml-2 px-2 py-1 text-xs text-white">Closest</span>}
              <span className="bg-gray-100 rounded-sm ml-2 px-2 py-1 text-xs whitespace-nowrap">{distance} mi</span>
            </div>

            <p className="text-gray-500 text-xs">
              {hasRichMedia && <Icon name="camera" className="mr-1.5 text-lime-600" />}
              <Timeago datetime={obsDt} /> by {userDisplayName}
            </p>
            <div className="text-[0.85em] mt-2 space-x-3">
              <a href={`https://ebird.org/checklist/${subId}`} target="_blank" rel="noreferrer">
                View Checklist
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${lat},${lng}`}
                target="_blank"
                rel="noreferrer"
              >
                Directions
              </a>
            </div>
          </li>
        )
      )}
    </ul>
  );
}
