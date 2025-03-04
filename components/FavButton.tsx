import React from "react";
import Icon from "components/Icon";
import { useTrip } from "providers/trip";

type Props = {
  locationId: string;
  code: string;
  name: string;
  range: string;
  percent: number;
};

export default function FavButton({ locationId, code, name, range, percent }: Props) {
  const { locations, addHotspotFav, removeHotspotFav } = useTrip();
  const location = locations.find((it) => it._id === locationId);
  const favIds = location?.favs?.map((it) => it.code) || [];
  const isFav = favIds.includes(code);
  const onClick = () => {
    if (isFav) {
      removeHotspotFav(locationId, code);
    } else {
      addHotspotFav(locationId, code, name, range, percent);
    }
  };
  return (
    <button type="button" onClick={onClick} className="text-base">
      {isFav ? <Icon name="heartSolid" className="text-pink-700" /> : <Icon name="heart" />}
    </button>
  );
}
