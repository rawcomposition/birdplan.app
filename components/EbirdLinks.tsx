import React from "react";
import { Trip } from "lib/types";
import ExternalIcon from "icons/External";
import Link from "next/link";

type Props = {
  trip: Trip;
};

export default function EbirdLinks({ trip }: Props) {
  return (
    <div className="mt-4 text-sm text-gray-400 flex flex-col gap-2">
      <Link
        href={`https://ebird.org/targets?region=&r1=${trip.region}&bmo=${trip.startMonth}&emo=${trip.endMonth}&r2=world&t2=life&mediaType=`}
        className="text-gray-400 inline-flex items-center gap-1"
        target="_blank"
      >
        <ExternalIcon className="text-xs" /> eBird Targets
      </Link>
      <Link
        href={`https://ebird.org/region/${trip.region}/media?yr=all&m=`}
        className="text-gray-400 inline-flex items-center gap-1"
        target="_blank"
      >
        <ExternalIcon className="text-xs" /> Illustrated Checklist
      </Link>
    </div>
  );
}
