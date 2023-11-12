import React from "react";
import clsx from "clsx";
import { useTrip } from "providers/trip";
import ExternalIcon from "icons/External";
import Link from "next/link";

export default function TripLinks() {
  const { trip, isOwner } = useTrip();
  const isMultiRegion = trip?.region.includes(",");

  if (!trip || isMultiRegion) return null;

  return (
    <div className={clsx("mb-8 ml-4 text-sm text-gray-400 flex flex-col gap-2", isOwner ? "mt-2 lg:mt-4" : "mt-4")}>
      <Link
        href={`https://ebird.org/targets?region=&r1=${trip.region}&bmo=${trip.startMonth}&emo=${trip.endMonth}&r2=world&t2=life&mediaType=`}
        className="text-gray-400 inline-flex items-center gap-1"
        target="_blank"
      >
        <ExternalIcon className="text-xs" /> eBird Targets
      </Link>
      <Link
        href={`https://ebird.org/region/${trip.region}/media?yr=all&m=`}
        className="text-gray-400 inline-flex items-center gap-2"
        target="_blank"
      >
        <ExternalIcon className="text-xs" /> Illustrated Checklist
      </Link>
    </div>
  );
}
