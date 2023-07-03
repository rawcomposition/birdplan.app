import React from "react";
import Link from "next/link";
import { Trip } from "lib/types";

type Props = {
  trip: Trip;
};

export default function TripCard({ trip }: Props) {
  const [render, setRender] = React.useState(false);
  const { id, name, hotspots } = trip;

  // Avoid hydration errors from loading trips from localStorage
  React.useEffect(() => {
    setRender(true);
  }, []);

  if (!render) return null;

  return (
    <Link href={`/${id}`}>
      <div className="bg-white rounded-lg shadow relative p-4">
        {trip?.bounds?.minX && (
          <img
            src={`https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/static/[${trip?.bounds?.minX},${trip?.bounds?.minY},${trip?.bounds?.maxX},${trip?.bounds?.maxY}]/300x180@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_KEY}&padding=30`}
            className="w-full h-36 object-cover rounded-lg mb-3 object-[0_20%]"
            alt=""
          />
        )}
        <div>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 mb-2">{name}</h2>
          </div>
          <p className="text-sm text-gray-500">
            {hotspots.length} {hotspots.length === 1 ? "hotspot" : "hotspots"}
          </p>
        </div>
      </div>
    </Link>
  );
}
