import React from "react";
import Link from "next/link";
import { Trip } from "@birdplan/shared";
import ReactCountryFlag from "react-country-flag";

type Props = {
  trip: Trip;
};

export default function TripCard({ trip }: Props) {
  const [render, setRender] = React.useState(false);
  const { _id, name, hotspots } = trip;

  // Avoid hydration errors from loading trips from localStorage
  React.useEffect(() => {
    setRender(true);
  }, []);

  if (!render) return null;

  return (
    <Link href={`/${_id}`}>
      <div className="bg-white rounded-lg shadow relative p-4">
        {trip?.imgUrl && (
          <img
            src={trip?.imgUrl}
            className="w-full h-36 object-cover rounded-lg mb-3"
            alt=""
            width={600}
            height={370}
          />
        )}
        <div>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 mb-2">{name}</h2>
            <ReactCountryFlag
              countryCode={trip.region.slice(0, 2)}
              style={{ fontSize: "1.6rem" }}
              aria-label="country flag"
            />
          </div>
          <p className="text-sm text-gray-500">
            {hotspots.length} {hotspots.length === 1 ? "saved hotspot" : "saved hotspots"}
          </p>
        </div>
      </div>
    </Link>
  );
}
