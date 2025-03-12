import React from "react";
import Icon from "components/Icon";
import { useTrip } from "providers/trip";
import useTripMutation from "hooks/useTripMutation";
import { HotspotFav } from "lib/types";

type Props = {
  hotspotId: string;
  code: string;
  name: string;
  range: string;
  percent: number;
};

export default function FavButton({ hotspotId, code, name, range, percent }: Props) {
  const { trip, canEdit } = useTrip();
  const hotspot = trip?.hotspots.find((it) => it.id === hotspotId);
  const favIds = hotspot?.favs?.map((it) => it.code) || [];
  const isFav = favIds.includes(code);

  const addFavMutation = useTripMutation<HotspotFav>({
    url: `/api/trips/${trip?._id}/hotspots/${hotspotId}/add-species-fav`,
    method: "POST",
    updateCache: (old, input) => ({
      ...old,
      hotspots: old.hotspots.map((it) => (it.id === hotspotId ? { ...it, favs: [...(it.favs || []), input] } : it)),
    }),
  });

  const removeFavMutation = useTripMutation<{ code: string }>({
    url: `/api/trips/${trip?._id}/hotspots/${hotspotId}/remove-species-fav`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      hotspots: old.hotspots.map((it) =>
        it.id === hotspotId ? { ...it, favs: it.favs?.filter((it) => it.code !== input.code) } : it
      ),
    }),
  });

  const onClick = () => {
    if (isFav) {
      removeFavMutation.mutate({ code });
    } else {
      addFavMutation.mutate({ code, name, range, percent });
    }
  };
  return (
    <button type="button" onClick={onClick} className="text-base" disabled={!canEdit}>
      {isFav ? <Icon name="heartSolid" className="text-pink-700" /> : <Icon name="heart" />}
    </button>
  );
}
