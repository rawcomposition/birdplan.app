import React from "react";
import Link from "next/link";
import { Trip } from "lib/types";
import { images } from "../images";
import Info from "icons/Info";

type Image = {
  url: string;
  by?: string;
};

type Props = {
  trip: Trip;
};

export default function TripCard({ trip }: Props) {
  const [render, setRender] = React.useState(false);
  const { id, name, hotspots, region } = trip;
  const regionPieces = region.split(",")[0]?.split("-");
  const stateCode = regionPieces.length >= 2 ? `${regionPieces[0]}-${regionPieces[1]}` : null;
  const countryCode = regionPieces[0];

  const image: Image = images[stateCode as keyof typeof images] || images[countryCode as keyof typeof images];

  // Avoid hydration errors from loading trips from localStorage
  React.useEffect(() => {
    setRender(true);
  }, []);

  if (!render) return null;

  return (
    <Link href={`/${id}`}>
      <div className="bg-white rounded-lg shadow relative p-4">
        {image?.by && (
          <div className="absolute left-5 top-5 text-xs text-gray-600 rounded-full bg-white/50 group flex gap-1">
            <Info className="text-[14px] p-0.5" />
            <span className="hidden group-hover:block pr-2">Image by {image.by}</span>
          </div>
        )}
        <img
          src={
            image
              ? `https://cdn.download.ams.birds.cornell.edu/api/v1/asset/${image.url}/640`
              : `https://source.unsplash.com/d2uHXWTkGn4/600`
          }
          className="w-full h-36 object-cover rounded-lg mb-3 object-[0_20%]"
          alt=""
        />
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
