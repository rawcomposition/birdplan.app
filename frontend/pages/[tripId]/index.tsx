import React from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { Day } from "@birdplan/shared";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "components/ui/card";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import { Skeleton } from "components/ui/skeleton";
import Avatar from "components/Avatar";
import MarkerWithIcon from "components/MarkerWithIcon";
import { Tooltip, TooltipTrigger, TooltipContent } from "components/ui/tooltip";
import TripDocuments from "components/TripDocuments";
import { useTrip } from "hooks/useTrip";
import { useModal } from "stores/modals";
import useDownloadTargets from "hooks/useDownloadTargets";
import useTargetView from "hooks/useTargetView";
import { useSpeciesImages } from "hooks/useSpeciesImages";
import { avatarFromParticipant } from "lib/avatar";
import { getMarkerColor } from "lib/helpers";
import { MarkerIconT } from "lib/icons";
import {
  Feather,
  MapPin,
  StickyNote,
  Star,
  Globe,
  Lock,
  UserPlus,
  PencilLine,
  Share2,
  ArrowRight,
  CalendarDays,
} from "lucide-react";

const HOTSPOT_ROWS = 6;
const MARKER_ROWS = 4;
const ITINERARY_ROWS = 6;
const TARGET_ROWS = 5;

const rowClass = "-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50";

const SectionTitle = ({ title, count }: { title: string; count?: number | null }) => (
  <CardTitle>
    {title}
    {count != null && <span className="ml-2 text-sm font-medium text-muted-foreground tabular-nums">{count}</span>}
  </CardTitle>
);

const SectionLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Button href={to} variant="link" className="inline-flex items-center gap-1 text-sm whitespace-nowrap">
    {children} <ArrowRight className="size-3.5" />
  </Button>
);

export default function TripOverview() {
  const { trip, participants, canEdit, dateRangeLabel } = useTrip();
  const { open, close, modalId } = useModal();
  const { getSpeciesImg } = useSpeciesImages();

  const { data: regionData, isLoading: isLoadingTargets } = useDownloadTargets({
    region: trip?.region,
    startMonth: trip?.startMonth,
    endMonth: trip?.endMonth,
    enabled: !!trip,
  });

  const { lifelist } = useTargetView(trip);
  const targetSpecies = regionData?.items?.filter((it) => !lifelist.includes(it.code)) || [];
  const topTargets = [...targetSpecies].sort((a, b) => b.frequency - a.frequency).slice(0, TARGET_ROWS);

  const handleDivClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!modalId) return;
    if (!e.currentTarget.contains(e.target as Node)) return;
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

  const hotspots = trip?.hotspots || [];
  const markers = trip?.markers || [];
  const itinerary = trip?.itinerary || [];
  const description = trip?.description || "";
  const starredCodes = trip?.targetStars || [];
  const hiddenPlaceCount = Math.max(0, hotspots.length - HOTSPOT_ROWS) + Math.max(0, markers.length - MARKER_ROWS);

  const locationName = (loc: Day["locations"][number]) =>
    loc.type === "hotspot"
      ? hotspots.find((it) => it.id === loc.locationId)?.name
      : markers.find((it) => it.id === loc.locationId)?.name;

  const dayLabel = (index: number) =>
    trip?.startDate ? dayjs(trip.startDate).add(index, "day").format("ddd, MMM D") : null;

  return (
    <>
      {trip && <title>{`${trip.name} | BirdPlan.app`}</title>}
      <div className="h-full grow flex flex-col w-full">
        <div className="h-full overflow-auto" onClick={handleDivClick}>
          <div className="mt-4 sm:mt-8 max-w-5xl w-full mx-auto p-4 lg:p-0 pb-12 lg:pb-12">
            <div className="relative overflow-hidden rounded-2xl border shadow-xs bg-card">
              {trip?.imgUrl ? (
                <img src={trip.imgUrl} alt="" className="h-44 sm:h-56 w-full object-cover" />
              ) : (
                <div className="h-44 sm:h-56 w-full bg-muted" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {countdown && (
                <Badge className="absolute top-4 right-4 bg-card/90 text-foreground shadow-xs">{countdown}</Badge>
              )}
              <div className="absolute bottom-0 left-0 right-0 flex items-end gap-4 p-5 sm:p-6 text-white">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{trip?.name}</h1>
                  <p className="mt-1 text-sm text-white/85">
                    {dateLabel}
                    {trip?.ownerName && <> · Organized by {trip.ownerName}</>}
                  </p>
                </div>
                {!!participants?.length && (
                  <Link
                    to={`/${trip?._id}/participants`}
                    aria-label="View participants"
                    className="hidden sm:flex shrink-0 -space-x-2"
                  >
                    {participants.slice(0, 5).map((p) => (
                      <Tooltip key={p._id}>
                        <TooltipTrigger
                          render={
                            <span className="flex rounded-full ring-2 ring-white/90">
                              <Avatar user={avatarFromParticipant(p)} size={30} />
                            </span>
                          }
                        />
                        <TooltipContent>{p.name || p.email}</TooltipContent>
                      </Tooltip>
                    ))}
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-4 items-start lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <Card>
                  <CardHeader className="pb-0">
                    <SectionTitle title="Places" count={hotspots.length + markers.length || null} />
                    <CardAction>
                      <SectionLink to={`/${trip?._id}/map`}>Open map</SectionLink>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {hotspots.length || markers.length ? (
                      <div className="flex flex-col">
                        {hotspots.slice(0, HOTSPOT_ROWS).map((hotspot) => (
                          <button
                            key={hotspot.id}
                            type="button"
                            className={rowClass}
                            onClick={() => open("hotspot", { hotspot })}
                          >
                            <span
                              className="size-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: getMarkerColor(hotspot.species || 0) }}
                            />
                            <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-foreground">
                              {hotspot.name}
                            </span>
                            {hotspot.notes && <StickyNote className="size-3.5 shrink-0 text-muted-foreground/70" />}
                            {hotspot.species != null && (
                              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                {hotspot.species.toLocaleString()} species
                              </span>
                            )}
                          </button>
                        ))}
                        {markers.slice(0, MARKER_ROWS).map((marker) => (
                          <button
                            key={marker.id}
                            type="button"
                            className={rowClass}
                            onClick={() => open("viewMarker", { markerId: marker.id })}
                          >
                            <MarkerWithIcon
                              icon={marker.icon as MarkerIconT}
                              showStroke={false}
                              className="scale-75 shrink-0 -m-0.5"
                            />
                            <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-foreground">
                              {marker.name}
                            </span>
                            {marker.notes && <StickyNote className="size-3.5 shrink-0 text-muted-foreground/70" />}
                          </button>
                        ))}
                        {hiddenPlaceCount > 0 && (
                          <Link
                            to={`/${trip?._id}/map`}
                            className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-link hover:bg-muted/50"
                          >
                            <span className="w-2.5 shrink-0" />+{hiddenPlaceCount} more on the map
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 py-4 text-center">
                        <MapPin className="size-5 text-muted-foreground/60" />
                        <p className="text-sm text-muted-foreground">No saved places yet.</p>
                        {canEdit && (
                          <Button href={`/${trip?._id}/map`} variant="outline" size="sm" className="mt-1">
                            Find hotspots on the map
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-0">
                    <SectionTitle title="Itinerary" count={itinerary.length || null} />
                    <CardAction>
                      <SectionLink to={`/${trip?._id}/itinerary`}>
                        {canEdit ? "Plan days" : "Full itinerary"}
                      </SectionLink>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {itinerary.length ? (
                      <div className="flex flex-col">
                        {itinerary.slice(0, ITINERARY_ROWS).map((day, i) => {
                          const names = day.locations.map(locationName).filter(Boolean);
                          return (
                            <Link key={day.id} to={`/${trip?._id}/itinerary`} className={rowClass}>
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-secondary-foreground tabular-nums">
                                {i + 1}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium text-foreground">
                                  {dayLabel(i) || `Day ${i + 1}`}
                                </span>
                                <span className="block truncate text-xs text-muted-foreground">
                                  {names.length ? names.join(" → ") : "No stops yet"}
                                </span>
                              </span>
                              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                {day.locations.length} {day.locations.length === 1 ? "stop" : "stops"}
                              </span>
                            </Link>
                          );
                        })}
                        {itinerary.length > ITINERARY_ROWS && (
                          <Link
                            to={`/${trip?._id}/itinerary`}
                            className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-link hover:bg-muted/50"
                          >
                            <span className="w-9 shrink-0" />
                            View all {itinerary.length} days
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 py-4 text-center">
                        <CalendarDays className="size-5 text-muted-foreground/60" />
                        <p className="text-sm text-muted-foreground">No days planned yet.</p>
                        {canEdit && (
                          <Button href={`/${trip?._id}/itinerary`} variant="outline" size="sm" className="mt-1">
                            Start planning
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {(isLoadingTargets || topTargets.length > 0) && (
                  <Card>
                    <CardHeader className="pb-0">
                      <SectionTitle title="Targets" count={regionData ? targetSpecies.length : null} />
                      <CardAction>
                        <SectionLink to={`/${trip?._id}/targets`}>All targets</SectionLink>
                      </CardAction>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex flex-col">
                        {isLoadingTargets
                          ? Array.from({ length: TARGET_ROWS }, (_, i) => (
                              <div key={i} className="flex items-center gap-3 py-2">
                                <Skeleton className="h-10 aspect-[4/3] rounded-md" />
                                <div className="flex-1 space-y-1.5">
                                  <Skeleton className="h-3.5 w-40" />
                                  <Skeleton className="h-1 w-32" />
                                </div>
                              </div>
                            ))
                          : topTargets.map((target) => {
                              const img = getSpeciesImg(target.code, "320");
                              const pct = Math.round(target.frequency);
                              return (
                                <Link
                                  key={target.code}
                                  to={`/${trip?._id}/targets/${target.code}`}
                                  className={rowClass}
                                >
                                  {img ? (
                                    <img
                                      src={img.url}
                                      alt=""
                                      loading="lazy"
                                      className="h-10 aspect-[4/3] shrink-0 rounded-md object-cover"
                                    />
                                  ) : (
                                    <span className="flex h-10 aspect-[4/3] shrink-0 items-center justify-center rounded-md bg-muted">
                                      <Feather className="size-4 text-muted-foreground/50" />
                                    </span>
                                  )}
                                  <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                      <span className="truncate">{target.name}</span>
                                      {starredCodes.includes(target.code) && (
                                        <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                                      )}
                                    </span>
                                    <span className="mt-1.5 block h-1 max-w-44 rounded-full bg-muted">
                                      <span
                                        className="block h-1 rounded-full bg-primary/70"
                                        style={{ width: `${Math.min(100, pct)}%` }}
                                      />
                                    </span>
                                  </span>
                                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                    {pct}% of checklists
                                  </span>
                                </Link>
                              );
                            })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-4">
                {(canEdit || description) && (
                  <Card>
                    <CardHeader className="pb-0">
                      <SectionTitle title="Notes" />
                      {canEdit && (
                        <CardAction>
                          <Button variant="ghost" size="sm" onClick={() => open("tripNotes")}>
                            <PencilLine className="size-4" />
                            {description ? "Edit" : "Add"}
                          </Button>
                        </CardAction>
                      )}
                    </CardHeader>
                    <CardContent className="pt-3">
                      {description ? (
                        <p className="whitespace-pre-wrap text-sm text-secondary-foreground">{description}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Plans, goals, meeting details — notes are visible to anyone who can view the trip.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {!!participants?.length && (
                  <Card>
                    <CardHeader className="pb-0">
                      <SectionTitle title="Participants" count={participants.length} />
                      {canEdit && (
                        <CardAction>
                          <Button variant="ghost" size="sm" onClick={() => open("addParticipant")}>
                            <UserPlus className="size-4" />
                            Invite
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
                                {p.isMe && (
                                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>
                                )}
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
                      {canEdit && (
                        <Button
                          href={`/${trip?._id}/participants`}
                          variant="link"
                          className="mt-2 inline-flex items-center gap-1 px-0 text-sm text-link whitespace-nowrap"
                        >
                          Manage participants <ArrowRight className="size-3.5" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                <TripDocuments />

                {canEdit && (
                  <Card>
                    <CardHeader className="pb-0">
                      <SectionTitle title="Sharing" />
                      <CardAction>
                        <Button variant="ghost" size="sm" onClick={() => open("share")}>
                          <Share2 className="size-4" />
                          Share
                        </Button>
                      </CardAction>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                          {trip?.isPublic ? (
                            <Globe className="size-4 text-secondary-foreground" />
                          ) : (
                            <Lock className="size-4 text-secondary-foreground" />
                          )}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{trip?.isPublic ? "Public trip" : "Private trip"}</p>
                          <p className="text-xs text-muted-foreground">
                            {trip?.isPublic
                              ? "Anyone with the link can view this trip"
                              : "Only trip participants can view this trip"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
