import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "components/ui/dropdown-menu";
import Icon from "components/Icon";
import KebabMenuTrigger from "components/KebabMenuTrigger";
import { Map, Star, ExternalLink, Check } from "lucide-react";
import { Card } from "components/ui/card";
import MutualBadge from "components/MutualBadge";
import MonthlyFrequencyChart from "components/MonthlyFrequencyChart";
import useTripLifelist from "hooks/useTripLifelist";
import { useSpeciesImages } from "hooks/useSpeciesImages";
import { useTrip } from "hooks/useTrip";
import { useQueryClient } from "@tanstack/react-query";
import useMutation from "hooks/useMutation";
import useTripMutation from "hooks/useTripMutation";
import type { User } from "@birdplan/shared";

type Props = {
  name: string;
  scientificName?: string;
  code: string;
  starred: boolean;
  mutual: boolean;
  seen: boolean;
  monthly: number[];
  onShowMap: () => void;
};

export default function SpeciesHero({ name, scientificName, code, starred, mutual, seen, monthly, onShowMap }: Props) {
  const { trip, canEdit } = useTrip();
  const { getSpeciesImg } = useSpeciesImages();
  const photo = getSpeciesImg(code, "900");
  const queryClient = useQueryClient();
  const { myLifelist } = useTripLifelist(trip);

  const canMutate = canEdit && !!code;
  const viewerListMode = trip?.viewer?.listMode ?? "world";
  const isStarred = !!trip?.targetStars?.includes(code);
  const isSeen = myLifelist.includes(code);

  const worldSeenMutation = useMutation({
    url: `/profile/lifelist/add`,
    method: "POST",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
      queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}`] });
    },
    onMutate: async (data: any) => {
      await queryClient.cancelQueries({ queryKey: ["/auth/me"] });
      const prevData = queryClient.getQueryData(["/auth/me"]);
      queryClient.setQueryData<User | undefined>(["/auth/me"], (old) =>
        old
          ? {
              ...old,
              lifelist: [...(old.lifelist || []), data.code],
              exceptions: (old.exceptions || []).filter((it) => it !== data.code),
            }
          : old,
      );
      return { prevData };
    },
    onError: (_e: any, _d: any, ctx: any) => queryClient.setQueryData(["/auth/me"], ctx?.prevData),
  });

  const customSeenMutation = useTripMutation<{ code: string }>({
    url: `/trips/${trip?._id}/participants/${trip?.viewer?.participantId}/seen`,
    method: "POST",
    updateCache: (old, input) => ({
      ...old,
      viewerLifelist: [...(old.viewerLifelist || []), input.code],
    }),
  });

  const addStarMutation = useTripMutation<{ code: string }>({
    url: `/trips/${trip?._id}/targets/add-star`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      targetStars: [...(old.targetStars ?? []), input.code],
    }),
  });

  const removeStarMutation = useTripMutation<{ code: string }>({
    url: `/trips/${trip?._id}/targets/remove-star`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      targetStars: (old.targetStars || []).filter((it) => it !== input.code),
    }),
  });

  const handleToggleStar = () => {
    if (!canMutate) return;
    if (isStarred) removeStarMutation.mutate({ code });
    else addStarMutation.mutate({ code });
  };

  const handleMarkSeen = () => {
    if (!canMutate || isSeen) return;
    const listLabel = viewerListMode === "custom" ? "your custom list for this trip" : "your life list";
    if (!confirm(`Are you sure you want to add ${name} to ${listLabel}?`)) return;
    if (viewerListMode === "custom") customSeenMutation.mutate({ code });
    else worldSeenMutation.mutate({ code });
  };

  return (
    <Card className="overflow-hidden flex flex-col sm:flex-row">
      <div
        className="bg-gray-100 sm:w-[360px] sm:shrink-0 aspect-4/3 sm:self-start bg-cover bg-center"
        style={photo?.url ? { backgroundImage: `url(${photo.url})` } : undefined}
        title={photo?.by ? `Photo by ${photo.by}` : undefined}
      >
        {!photo?.url && <div className="w-full h-full bg-gray-200" />}
      </div>

      <div className="flex-1 p-5 sm:px-6 sm:py-5 flex flex-col gap-4 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">{name}</h1>
              {starred && <Icon name="star" className="text-star text-lg" />}
              {mutual && <MutualBadge size="md" />}
              {seen && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                  <Icon name="check" className="text-[10px]" />
                  Seen
                </span>
              )}
            </div>
            {scientificName && <div className="italic text-gray-600 text-sm mt-1">{scientificName}</div>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DropdownMenu>
              <KebabMenuTrigger aria-label="More actions" />
              <DropdownMenuContent align="end" className="w-auto min-w-[220px]">
                <DropdownMenuItem onClick={onShowMap}>
                  <Map className="text-gray-500" />
                  View Map
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleStar} disabled={!canEdit}>
                  <Star
                    className={starred ? undefined : "text-gray-500"}
                    fill={starred ? "rgb(234 179 8)" : "none"}
                    stroke={starred ? "rgb(234 179 8)" : "currentColor"}
                  />
                  {starred ? "Remove star" : "Star species"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<a href={`https://ebird.org/species/${code}`} target="_blank" rel="noopener noreferrer" />}
                >
                  <ExternalLink className="text-gray-500" />
                  View on eBird
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMarkSeen} disabled={!canEdit || seen}>
                  <Check className={seen ? "text-success" : "text-gray-500"} />
                  {seen ? "Marked as seen" : "Mark as seen"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <MonthlyFrequencyChart
          monthly={monthly}
          startMonth={trip?.startMonth}
          endMonth={trip?.endMonth}
          className="mt-10 sm:mt-auto"
        />
      </div>
    </Card>
  );
}
