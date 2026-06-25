import { Link } from "react-router-dom";
import { TripListItem } from "@birdplan/shared";
import ReactCountryFlag from "react-country-flag";
import Avatar from "components/Avatar";
import { formatTripDateRange, tripDurationDays, tripDaysUntilStart } from "lib/helpers";

type Props = {
  trip: TripListItem;
};

const MAX_AVATARS = 5;

export default function TripCard({ trip }: Props) {
  const { _id, name, region, imgUrl, hotspotCount, participants = [] } = trip;
  const durationDays = tripDurationDays(trip);
  const daysUntilStart = tripDaysUntilStart(trip);
  const participantCount = participants.length || 1;
  const shownAvatars = participants.slice(0, MAX_AVATARS);
  const extraAvatars = participants.length - shownAvatars.length;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white sm:flex-row">
      <Link to={`/${_id}`} className="relative block aspect-[300/185] w-full shrink-0 bg-gray-100 sm:w-56">
        {imgUrl && <img src={imgUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        {daysUntilStart !== null && (
          <div className="absolute top-2.5 left-2.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-800 shadow-md">
            {daysUntilStart === 0 ? "Today" : `In ${daysUntilStart} ${daysUntilStart === 1 ? "day" : "days"}`}
          </div>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-4">
        <Link to={`/${_id}`} className="mb-1 truncate">
          <h2 className="truncate text-2xl font-bold text-gray-800">{name}</h2>
        </Link>
        <div className="flex items-center gap-2">
          <ReactCountryFlag
            countryCode={region.slice(0, 2)}
            style={{ fontSize: "1.1rem" }}
            className="shrink-0"
            aria-label="country flag"
          />
          <p className="text-gray-600 text-sm">
            {formatTripDateRange(trip)}
            {durationDays && ` · ${durationDays} ${durationDays === 1 ? "day" : "days"}`}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            <b className="font-bold text-gray-800">{hotspotCount}</b> hotspots &nbsp;·&nbsp;
            <b className="font-bold text-gray-800">{participantCount}</b>{" "}
            {participantCount === 1 ? "participant" : "participants"}
          </p>
          {participants.length > 0 && (
            <div className="flex shrink-0 items-center -space-x-2">
              {shownAvatars.map((p) => (
                <Avatar
                  key={p._id}
                  user={{ seed: p.userId || p._id, name: p.name, photoUrl: p.photoUrl }}
                  gravatar={false}
                  size={28}
                  className="ring-2 ring-white"
                />
              ))}
              {extraAvatars > 0 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary ring-2 ring-white">
                  +{extraAvatars}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
