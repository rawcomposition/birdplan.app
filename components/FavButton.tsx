import React from "react";
import Heart from "icons/Heart";
import HeartSolid from "icons/HeartSolid";
import { useTrip } from "providers/trip";

type Props = {
  locId: string;
  code: string;
  name: string;
  range: string;
  percent: number;
};

export default function FavButton({ locId, code, name, range, percent }: Props) {
  const { trip, addHotspotFav, removeHotspotFav } = useTrip();
  const hotspot = trip?.hotspots.find((it) => it.id === locId);
  const favIds = hotspot?.favs?.map((it) => it.code) || [];
  const isFav = favIds.includes(code);
  const onClick = () => {
    if (isFav) {
      removeHotspotFav(locId, code);
    } else {
      addHotspotFav(locId, code, name, range, percent);
    }
  };
  return (
    <button type="button" onClick={onClick} className="text-base">
      {isFav ? <HeartSolid className="text-pink-700" /> : <Heart />}
    </button>
  );
}
