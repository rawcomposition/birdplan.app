import React from "react";
import { Header, Body } from "components/Modal";
import { Day, HotspotInput, Hotspot as HotspotT, Trip } from "@birdplan/shared";
import { Button } from "components/ui/button";
import toast from "react-hot-toast";
import { useTrip } from "hooks/useTrip";
import DirectionsButton from "components/DirectionsButton";
import { isRegionEnglish, getMarkerColor, nanoId } from "lib/helpers";
import RecentSpeciesList from "components/RecentSpeciesList";
import HotspotStats from "components/HotspotStats";
import RecentChecklistList from "components/RecentChecklistList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "components/ui/tabs";
import InputNotes from "components/InputNotes";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import KebabMenuTrigger from "components/KebabMenuTrigger";
import HotspotTargets from "components/HotspotTargets";
import HotspotFavs from "components/HotspotFavs";
import Icon from "components/Icon";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { getTripDays } from "lib/itinerary";
import useTripMutation from "hooks/useTripMutation";
import useMutation from "hooks/useMutation";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  hotspot: HotspotT;
};

export default function Hotspot({ hotspot }: Props) {
  const { trip, canEdit, selectedSpecies, setSelectedMarkerId, setHalo } = useTrip();
  const { id, lat, lng, species } = hotspot;
  const savedHotspot = trip?.hotspots.find((it) => it.id === id);
  const isSaved = !!savedHotspot;
  const name = savedHotspot?.name || hotspot.name;
  const notes = savedHotspot?.notes;
  const originalName = savedHotspot?.originalName;
  const [modalSpecies, setModalSpecies] = React.useState(selectedSpecies);
  const [tab, setTab] = React.useState(modalSpecies ? "checklists" : "targets");
  const location = useLocation();
  const queryClient = useQueryClient();

  const tabs = [
    {
      label: "Targets",
      title: "",
      id: "targets",
    },
    {
      label: "Recent Needs",
      title: "",
      id: "needs",
    },
    {
      label: "Checklists",
      title: "",
      id: "checklists",
    },
  ];

  const removeMutation = useTripMutation({
    url: `/trips/${trip?._id}/hotspots/${id}`,
    method: "DELETE",
    updateCache: (old) => ({
      ...old,
      hotspots: old.hotspots.filter((it) => it.id !== id),
    }),
  });

  const saveNotesMutation = useTripMutation<{ notes: string }>({
    url: `/trips/${trip?._id}/hotspots/${id}/notes`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      hotspots: old.hotspots.map((it) => (it.id === id ? { ...it, notes: input.notes } : it)),
    }),
  });

  const translateMutation = useMutation<{ originalName: string; translatedName: string }>({
    url: `/trips/${trip?._id}/hotspots/${id}/translate-name`,
    method: "PATCH",
    onSuccess: (data) => {
      const { originalName, translatedName } = data;
      if (!translatedName || translatedName === originalName) {
        toast("No translation found");
        return;
      }
      queryClient.setQueryData<Trip | undefined>([`/trips/${trip?._id}`], (old) => {
        if (!old) return old;
        return {
          ...old,
          hotspots: old.hotspots.map((it) =>
            it.id === id ? { ...it, name: translatedName, originalName: originalName } : it
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}`] });
    },
  });

  const resetMutation = useTripMutation({
    url: `/trips/${trip?._id}/hotspots/${id}/reset-name`,
    method: "PATCH",
    updateCache: (old) => ({
      ...old,
      hotspots: old.hotspots.map((it) =>
        it.id === id ? { ...it, name: it.originalName || "", originalName: "" } : it
      ),
    }),
  });

  const addHotspotMutation = useTripMutation<HotspotInput>({
    url: `/trips/${trip?._id}/hotspots`,
    method: "POST",
    updateCache: (old, input) => ({
      ...old,
      hotspots: [...(old.hotspots || []), input],
    }),
  });

  const handleSave = async () => {
    if (isSaved) {
      if (notes && !confirm("Are you sure you want to remove this hotspot from your trip? Your notes will be lost."))
        return;
      removeMutation.mutate({});
    } else {
      addHotspotMutation.mutate({ ...hotspot, species: hotspot.species || 0, checklists: hotspot.checklists || 0 });
    }
  };

  const hasSpecies = !!modalSpecies && location.pathname.includes("targets");
  React.useEffect(() => {
    if (hasSpecies) {
      setHalo({ lat, lng, color: "#ce0d02" });
    } else if (isSaved) {
      setSelectedMarkerId(id);
    } else if (!isSaved) {
      setHalo({ lat, lng, color: getMarkerColor(species || 0) });
    }
    setSelectedMarkerId(id);
    return () => {
      setSelectedMarkerId(undefined);
      setHalo(undefined);
    };
  }, [id, lat, lng, isSaved, species, hasSpecies]);

  const canTranslate = isSaved && canEdit && !isRegionEnglish(trip?.region || "");

  const days = getTripDays(trip);
  const dayIds = days.map((it) => it.id);
  const scheduledDayIndexes = days.flatMap((day, index) =>
    day.locations?.some((loc) => loc.locationId === id) ? [index] : []
  );
  const extraDayCount = scheduledDayIndexes.length - 1;
  const itineraryLabel = scheduledDayIndexes.length
    ? `${formatDayLabel(trip?.startDate, scheduledDayIndexes[0])}${extraDayCount > 0 ? ` +${extraDayCount}` : ""}`
    : "Itinerary";

  return (
    <>
      <Header>{name}</Header>
      <Body className="pb-10 sm:pb-4 relative">
        {canTranslate && (
          <div className="text-[12px] -mt-3 mb-4">
            {!originalName && !translateMutation.isPending && (
              <Button variant="link" type="button" className="block" onClick={() => translateMutation.mutate({})}>
                Translate
              </Button>
            )}
            {translateMutation.isPending && <div className="text-gray-400">Translating...</div>}
            {originalName && (
              <div className="text-gray-500">
                Original: {originalName} -{" "}
                <Button variant="link" type="button" onClick={() => resetMutation.mutate({})}>
                  Reset
                </Button>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-2 mb-6">
          {canEdit && (
            <Button
              variant="outline-white"
              size="sm"
              onClick={handleSave}
              aria-pressed={isSaved}
              className={isSaved ? "border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-50" : undefined}
            >
              <Icon
                name={isSaved ? "star" : "starOutline"}
                className={isSaved ? "text-yellow-500" : "text-gray-400"}
              />
              {isSaved ? "Saved" : "Save"}
            </Button>
          )}
          {canEdit && isSaved && !!days.length && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline-white"
                    size="sm"
                    aria-label={scheduledDayIndexes.length ? `Itinerary: ${itineraryLabel}` : undefined}
                  >
                    <Icon name="calendar" className="text-gray-400" />
                    {itineraryLabel}
                  </Button>
                }
              />
              <DropdownMenuContent align="start" className="min-w-[200px]">
                {days.map((day, index) => (
                  <ItineraryDayToggle
                    key={day.id}
                    day={day}
                    dayIndex={index}
                    dayIds={dayIds}
                    hotspotId={id}
                  />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <DirectionsButton lat={lat} lng={lng} hotspotId={id} />
          <DropdownMenu>
            <KebabMenuTrigger />
            <DropdownMenuContent align="end" className="w-[170px]">
              <DropdownMenuItem
                render={<a href={`https://ebird.org/hotspot/${id}/media?yr=all&m=`} target="_blank" rel="noreferrer" />}
              >
                Illustrated Checklist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <HotspotStats id={id} speciesTotal={hotspot.species} checklistsTotal={hotspot.checklists} />
        <HotspotFavs hotspotId={id} />

        {isSaved && (
          <InputNotes key={id} value={notes} onBlur={(value) => saveNotesMutation.mutate({ notes: value })} />
        )}
        <Tabs value={tab} onValueChange={(value) => setTab(value as string)}>
          <div className="-mx-4 sm:-mx-6 mb-3">
            <TabsList className="mt-6 bg-gray-100 px-6">
              {tabs.map(({ label, id, title }) => (
                <TabsTrigger key={id} value={id} title={title}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="sm:-mx-1.5">
            <TabsContent value="needs">
              <RecentSpeciesList
                locId={id}
                onSpeciesClick={(species) => {
                  setModalSpecies(species);
                  setTab("checklists");
                }}
              />
            </TabsContent>
            <TabsContent value="checklists">
              <RecentChecklistList
                hotspotId={id}
                speciesCode={modalSpecies?.code}
                speciesName={modalSpecies?.name}
              />
            </TabsContent>
            <TabsContent value="targets" keepMounted>
              <HotspotTargets
                hotspotId={id}
                onSpeciesClick={(species) => {
                  setModalSpecies(species);
                  setTab("checklists");
                }}
                onAddToTrip={handleSave}
              />
            </TabsContent>
          </div>
        </Tabs>
      </Body>
    </>
  );
}

const formatDayLabel = (startDate: string | undefined, dayIndex: number) =>
  startDate ? dayjs(startDate).add(dayIndex, "day").format("MMM D") : `Day ${dayIndex + 1}`;

type ItineraryDayToggleProps = {
  day: Day;
  dayIndex: number;
  dayIds: string[];
  hotspotId: string;
};

function ItineraryDayToggle({ day, dayIndex, dayIds, hotspotId }: ItineraryDayToggleProps) {
  const { trip } = useTrip();
  const entry = day.locations?.find((loc) => loc.locationId === hotspotId);
  const date = trip?.startDate ? dayjs(trip.startDate).add(dayIndex, "day").format("ddd, MMM D") : "";

  const addMutation = useTripMutation<
    { type: "hotspot"; locationId: string; id: string; dayIds: string[] },
    { itinerary: Day[] }
  >({
    url: `/trips/${trip?._id}/itinerary/${day.id}/add-location`,
    method: "POST",
    updateCache: (old, input) => ({
      ...old,
      itinerary: getTripDays(old).map((it) =>
        it.id === day.id
          ? {
              ...it,
              locations: [...(it.locations || []), { type: input.type, locationId: input.locationId, id: input.id }],
            }
          : it
      ),
    }),
    reconcile: (old, response) => ({ ...old, itinerary: response.itinerary }),
  });

  const removeMutation = useTripMutation<{ id: string }>({
    url: `/trips/${trip?._id}/itinerary/${day.id}/remove-location`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      itinerary: getTripDays(old).map((it) =>
        it.id === day.id ? { ...it, locations: it.locations?.filter((loc) => loc.id !== input.id) || [] } : it
      ),
    }),
  });

  const onCheckedChange = (checked: boolean) => {
    if (checked) {
      addMutation.mutate({ type: "hotspot", locationId: hotspotId, id: nanoId(6), dayIds });
    } else if (entry) {
      removeMutation.mutate({ id: entry.id });
    }
  };

  return (
    <DropdownMenuCheckboxItem
      checked={!!entry}
      onCheckedChange={onCheckedChange}
      closeOnClick={false}
      disabled={addMutation.isPending || removeMutation.isPending}
    >
      <span className="truncate">
        Day {dayIndex + 1}
        {date && <span className="text-muted-foreground"> · {date}</span>}
      </span>
    </DropdownMenuCheckboxItem>
  );
}
