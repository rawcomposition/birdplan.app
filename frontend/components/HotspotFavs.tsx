import React from "react";
import FavButton from "components/FavButton";
import { useTrip } from "providers/trip";

type Props = {
  hotspotId: string;
};

export default function HotspotFavs({ hotspotId }: Props) {
  const { trip } = useTrip();
  const hotspot = trip?.hotspots.find((it) => it.id === hotspotId);

  if (!hotspot?.favs?.length) return null;
  const sortedFavs = hotspot.favs.sort((a, b) => b.percent - a.percent);
  return (
    <div className="mt-8 mb-4">
      <h3 className="text-gray-900 text-sm font-bold mb-2">Favorites</h3>
      {sortedFavs.map(({ code, name, range, percent }) => (
        <div
          key={code}
          className="border-t last:border-b border-gray-100 py-1.5 text-gray-500/80 text-[13px] grid gap-2 grid-cols-1 sm:grid-cols-2 mx-1"
        >
          <div className="pt-2 text-gray-900 text-sm">{name}</div>
          <div className="flex gap-5">
            <FavButton hotspotId={hotspotId} code={code} name={name} range={range} percent={percent} />
            <div className="flex flex-col gap-1 w-full col-span-2">
              <div>
                <span className="text-gray-600 text-[15px] font-bold">
                  {percent > 1 ? Math.round(percent) : percent}%{" "}
                  <span className="text-gray-500 bg-gray-100 rounded-full px-1.5 py-0.5 text-[10px]">{range}</span>
                </span>{" "}
              </div>
              <div className="w-full bg-gray-200">
                <div className="h-2 bg-[#1c6900]" style={{ width: `${percent}%` }} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
