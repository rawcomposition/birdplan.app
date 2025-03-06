import React from "react";
import Icon from "components/Icon";
import { useTrip } from "providers/trip";
import useMutation from "hooks/useMutation";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  hotspotId: string;
  code: string;
  name: string;
  range: string;
  percent: number;
};

export default function FavButton({ hotspotId, code, name, range, percent }: Props) {
  const { trip, setTripCache } = useTrip();
  const queryClient = useQueryClient();
  const hotspot = trip?.hotspots.find((it) => it.id === hotspotId);
  const favIds = hotspot?.favs?.map((it) => it.code) || [];
  const isFav = favIds.includes(code);

  const addFavMutation = useMutation({
    url: `/api/trips/${trip?._id}/hotspots/${hotspotId}/add-species-fav`,
    method: "POST",
    onMutate: (data: any) =>
      setTripCache((old) => ({
        ...old,
        hotspots: old.hotspots.map((it) => (it.id === hotspotId ? { ...it, favs: [...(it.favs || []), data] } : it)),
      })),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${trip?._id}`] });
    },
    onError: (error, data, context) => {
      queryClient.setQueryData([`/api/trips/${trip?._id}`], (context as any)?.prevData);
    },
  });

  const removeFavMutation = useMutation({
    url: `/api/trips/${trip?._id}/hotspots/${hotspotId}/remove-species-fav`,
    method: "PUT",
    onMutate: (data: any) =>
      setTripCache((old) => ({
        ...old,
        hotspots: old.hotspots.map((it) =>
          it.id === hotspotId ? { ...it, favs: it.favs?.filter((it) => it.code !== data.code) } : it
        ),
      })),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${trip?._id}`] });
    },
    onError: (error, data, context) => {
      queryClient.setQueryData([`/api/trips/${trip?._id}`], (context as any)?.prevData);
    },
  });

  const onClick = () => {
    if (isFav) {
      removeFavMutation.mutate({ code });
    } else {
      addFavMutation.mutate({ code, name, range, percent });
    }
  };
  return (
    <button type="button" onClick={onClick} className="text-base">
      {isFav ? <Icon name="heartSolid" className="text-pink-700" /> : <Icon name="heart" />}
    </button>
  );
}
