import React from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "components/ui/card";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import { Skeleton } from "components/ui/skeleton";
import { Textarea } from "components/ui/textarea";
import Avatar from "components/Avatar";
import Stat from "components/Stat";
import { useTrip } from "hooks/useTrip";
import { useModal } from "stores/modals";
import useDownloadTargets from "hooks/useDownloadTargets";
import useTargetView from "hooks/useTargetView";
import { useSpeciesImages } from "hooks/useSpeciesImages";
import useTripMutation from "hooks/useTripMutation";
import { avatarFromParticipant } from "lib/avatar";
import { cn } from "lib/utils";
import { Feather, MapPin, CalendarDays, Users, UserPlus, ArrowRight } from "lucide-react";

const TEASER_COUNT = 6;

export default function TripOverview() {
  const { trip, participants, canEdit, dateRangeLabel } = useTrip();
  const { open, close, modalId } = useModal();
  const { getSpeciesImg } = useSpeciesImages();
  const [descriptionDraft, setDescriptionDraft] = React.useState<string | null>(null);

  const { data: regionData, isLoading: isLoadingTargets } = useDownloadTargets({
    region: trip?.region,
    startMonth: trip?.startMonth,
    endMonth: trip?.endMonth,
    enabled: !!trip,
  });

  const { lifelist } = useTargetView(trip);
  const targetSpecies = regionData?.items?.filter((it) => !lifelist.includes(it.code)) || [];
  const topTargets = [...targetSpecies].sort((a, b) => b.frequency - a.frequency).slice(0, TEASER_COUNT);

  const descriptionMutation = useTripMutation<{ description: string }>({
    url: `/trips/${trip?._id}/description`,
    method: "PATCH",
    updateCache: (old, input) => ({ ...old, description: input.description }),
  });

  const handleDescriptionBlur = () => {
    if (descriptionDraft === null) return;
    const next = descriptionDraft.trim();
    if (next !== (trip?.description || "")) descriptionMutation.mutate({ description: next });
    setDescriptionDraft(next || null);
  };

  const handleDivClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!modalId) return;
    if ((e.target as HTMLElement).closest("button")) return;
    close();
  };

  const dateLabel =
    trip?.startDate && trip?.endDate
      ? `${dayjs(trip.startDate).format("MMM D")} – ${dayjs(trip.endDate).format("MMM D, YYYY")}`
      : dateRangeLabel;

  const today = dayjs().startOf("day");
  const daysUntil = trip?.startDate ? dayjs(trip.startDate).startOf("day").diff(today, "day") : null;
  const isOngoing =
    trip?.startDate && trip?.endDate && daysUntil !== null && daysUntil <= 0 && !today.isAfter(dayjs(trip.endDate));
  const countdown = isOngoing ? "Happening now" : daysUntil !== null && daysUntil > 0 ? `In ${daysUntil} days` : null;

  const description = trip?.description || "";
  const stats = [
    {
      label: "Targets",
      value: regionData ? targetSpecies.length : null,
      icon: Feather,
      href: `/${trip?._id}/targets`,
    },
    {
      label: trip?.hotspots?.length === 1 ? "Saved hotspot" : "Saved hotspots",
      value: trip?.hotspots?.length ?? 0,
      icon: MapPin,
      href: `/${trip?._id}`,
    },
    {
      label: trip?.itinerary?.length === 1 ? "Day planned" : "Days planned",
      value: trip?.itinerary?.length ?? 0,
      icon: CalendarDays,
      href: `/${trip?._id}/itinerary`,
    },
    ...(participants
      ? [
          {
            label: participants.length === 1 ? "Participant" : "Participants",
            value: participants.length,
            icon: Users,
            href: `/${trip?._id}/participants`,
          },
        ]
      : []),
  ];

  return (
    <>
      {trip && <title>{`${trip.name} | BirdPlan.app`}</title>}
      <div className="h-full grow flex flex-col w-full">
        <div className="h-full overflow-auto" onClick={handleDivClick}>
          <div className="mt-4 sm:mt-8 max-w-3xl w-full mx-auto p-4 md:p-0 pb-12">
            <div className="relative overflow-hidden rounded-2xl border shadow-xs bg-card">
              {trip?.imgUrl ? (
                <img src={trip.imgUrl} alt="" className="h-44 sm:h-60 w-full object-cover" />
              ) : (
                <div className="h-44 sm:h-60 w-full bg-muted" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {countdown && (
                <Badge className="absolute top-4 right-4 bg-card/90 text-foreground shadow-xs">{countdown}</Badge>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{trip?.name}</h1>
                <p className="mt-1 text-sm text-white/85">
                  {dateLabel}
                  {trip?.ownerName && <> · Organized by {trip.ownerName}</>}
                </p>
              </div>
            </div>

            <div className={cn("mt-4 grid grid-cols-2 gap-3", stats.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3")}>
              {stats.map((stat) => (
                <Stat key={stat.label} {...stat} />
              ))}
            </div>

            {(canEdit || description) && (
              <Card className="mt-4">
                <CardHeader className="pb-0">
                  <CardTitle>About this trip</CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  {canEdit ? (
                    <Textarea
                      value={descriptionDraft ?? description}
                      onChange={(e) => setDescriptionDraft(e.target.value)}
                      onBlur={handleDescriptionBlur}
                      placeholder="Add a description — plans, goals, meeting details. Anyone who can view the trip will see it."
                      rows={3}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm text-secondary-foreground">{description}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {(isLoadingTargets || topTargets.length > 0) && (
              <Card className="mt-4">
                <CardHeader className="pb-0">
                  <CardTitle>Top targets</CardTitle>
                  <CardAction>
                    <Button href={`/${trip?._id}/targets`} variant="link" className="text-sm whitespace-nowrap">
                      All targets <ArrowRight className="size-3.5" />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {isLoadingTargets
                      ? Array.from({ length: TEASER_COUNT }, (_, i) => (
                          <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
                        ))
                      : topTargets.map((target) => {
                          const img = getSpeciesImg(target.code, "320");
                          return (
                            <Link
                              key={target.code}
                              to={`/${trip?._id}/targets/${target.code}`}
                              className="group relative overflow-hidden rounded-lg border"
                            >
                              {img ? (
                                <img
                                  src={img.url}
                                  alt={target.name}
                                  loading="lazy"
                                  className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-[1.03]"
                                />
                              ) : (
                                <div className="aspect-[4/3] w-full bg-muted flex items-center justify-center">
                                  <Feather className="size-6 text-muted-foreground/50" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-2.5 text-white">
                                <div className="text-sm font-medium leading-tight">{target.name}</div>
                                <div className="text-[11px] text-white/80">{Math.round(target.frequency)}% of checklists</div>
                              </div>
                            </Link>
                          );
                        })}
                  </div>
                </CardContent>
              </Card>
            )}

            {!!participants?.length && (
              <Card className="mt-4">
                <CardHeader className="pb-0">
                  <CardTitle>Participants</CardTitle>
                  {canEdit && (
                    <CardAction className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => open("addParticipant")}>
                        <UserPlus className="size-4" />
                        Invite
                      </Button>
                      <Button href={`/${trip?._id}/participants`} variant="link" className="text-sm">
                        Manage
                      </Button>
                    </CardAction>
                  )}
                </CardHeader>
                <CardContent className="pt-3">
                  <ul className="flex flex-col gap-3">
                    {participants.map((p) => (
                      <li key={p._id} className="flex items-center gap-3">
                        <Avatar user={avatarFromParticipant(p)} size={32} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {p.name || p.email}
                            {p.isMe && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {p.status === "pending"
                              ? "Invite pending"
                              : p.hasList
                                ? `${p.count.toLocaleString()} species`
                                : "No life list"}
                          </p>
                        </div>
                        {p.isOwner && (
                          <Badge variant="secondary" className="ml-auto">
                            Owner
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
