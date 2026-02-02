import React from "react";
import { Body } from "providers/modals";
import { HotspotInput, Hotspot as HotspotT, Trip } from "@birdplan/shared";
import Button from "components/Button";
import toast from "react-hot-toast";
import { useTrip } from "providers/trip";
import DirectionsButton from "components/DirectionsButton";
import { isRegionEnglish, getMarkerColor, nanoId } from "lib/helpers";
import RecentSpeciesList from "components/RecentSpeciesList";
import HotspotStats from "components/HotspotStats";
import RecentChecklistList from "components/RecentChecklistList";
import clsx from "clsx";
import InputNotes from "components/InputNotes";
import { Menu } from "@headlessui/react";
import HotspotTargets from "components/HotspotTargets";
import HotspotFavs from "components/HotspotFavs";
import Icon from "components/Icon";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import useTripMutation from "hooks/useTripMutation";
import useMutation from "hooks/useMutation";
import { useMutation as useTanMutation, useQueryClient } from "@tanstack/react-query";
import { mutate } from "lib/http";

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
  const [tab, setTab] = React.useState(selectedSpecies ? "checklists" : "needs");
  const router = useRouter();
  const queryClient = useQueryClient();

  const tabs = [
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
    {
      label: "Targets",
      title: "",
      id: "targets",
    },
  ];

  const removeMutation = useTripMutation({
    url: `/trips/${trip?._id}/hotspots/${id}`,
    method: "DELETE",
    updateCache: (old, input) => ({
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

  type AddToItineraryInput = { dayId: string; locationEntryId: string; dayIndex: number };
  const addToItineraryMutation = useTanMutation<any, Error, AddToItineraryInput>({
    mutationFn: async ({ dayId, locationEntryId }) => {
      const payload = { type: "hotspot" as const, locationId: id, id: locationEntryId };
      await mutate("POST", `/trips/${trip?._id}/itinerary/${dayId}/add-location`, payload);
    },
    onMutate: async ({ dayId, locationEntryId }) => {
      if (!trip?._id) return;
      await queryClient.cancelQueries({ queryKey: [`/trips/${trip._id}`] });
      const prevData = queryClient.getQueryData([`/trips/${trip._id}`]);
      const payload = { type: "hotspot" as const, locationId: id, id: locationEntryId };
      queryClient.setQueryData<Trip | undefined>([`/trips/${trip._id}`], (old) => {
        if (!old) return old;
        return {
          ...old,
          itinerary:
            old.itinerary?.map((it) =>
              it.id === dayId ? { ...it, locations: [...(it.locations || []), payload] } : it
            ) ?? [],
        };
      });
      return { prevData };
    },
    onError: (err, _variables, context: any) => {
      toast.error(err.message || "An error occurred");
      if (context?.prevData) queryClient.setQueryData([`/trips/${trip?._id}`], context.prevData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}`] });
    },
    onSuccess: (_data, { dayIndex }) => {
      toast.success(`Added to Day ${dayIndex}`);
    },
  });

  const handleSave = async () => {
    if (isSaved) {
      if (notes && !confirm("Are you sure you want to remove this hotspot from your trip? Your notes will be lost."))
        return;
      removeMutation.mutate({});
    } else {
      addHotspotMutation.mutate({ ...hotspot, species: hotspot.species || 0 });
    }
  };

  const hasSpecies = !!selectedSpecies && router.pathname.includes("targets");
  React.useEffect(() => {
    if (hasSpecies) {
      // Use cyan color to distinguish selected hotspot from frequency colors
      setHalo({ lat, lng, color: "#0891b2" });
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

  return (
    <>
      <div className="pl-4 sm:pl-6 pr-12 py-4 border-b bg-gray-50">
        <h3 className="text-lg font-medium">{name}</h3>
        {canTranslate && (
          <div className="mt-0.5 text-[12px]">
            {!originalName && !translateMutation.isPending && (
              <button type="button" className="block text-sky-600" onClick={() => translateMutation.mutate({})}>
                Translate
              </button>
            )}
            {translateMutation.isPending && <div className="text-gray-400">Translating...</div>}
            {originalName && (
              <div className="text-gray-500">
                Original: {originalName} -{" "}
                <button type="button" className="text-sky-600" onClick={() => resetMutation.mutate({})}>
                  Reset
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Body className="pb-10 sm:pb-4 relative">
        <div className="flex gap-2 mb-6">
          <Button
            href={`https://ebird.org/targets?r1=${id}&bmo=1&emo=12&r2=world&t2=life`}
            target="_blank"
            color="gray"
            size="sm"
          >
            <Icon name="feather" className="mr-1 -mt-[3px] text-[#1c6900]" /> Targets
          </Button>
          <DirectionsButton lat={lat} lng={lng} hotspotId={id} />
          <Button
            href={`https://ebird.org/hotspot/${id}`}
            target="_blank"
            color="gray"
            size="sm"
            className="inline-flex items-center"
          >
            <img src="/ebird.png" width={48} />
          </Button>
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="text-[14px] rounded text-gray-600 bg-gray-100 px-2 py-[10px] inline-flex items-center">
              <Icon name="verticalDots" />
            </Menu.Button>
            <Menu.Items className="absolute text-sm right-0 top-10 rounded bg-white shadow-lg py-1.5 w-[170px] ring-1 ring-black ring-opacity-5 flex flex-col z-10">
              <Menu.Item>
                <a
                  href={`https://ebird.org/hotspot/${id}/media?yr=all&m=`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-700 hover:bg-gray-50 px-3 py-2"
                >
                  Illustrated Checklist
                </a>
              </Menu.Item>
              {canEdit && isSaved && (
                <Menu.Item>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-1 w-full text-red-700 px-3 py-2 hover:bg-gray-50"
                  >
                    Remove from trip
                  </button>
                </Menu.Item>
              )}
            </Menu.Items>
          </Menu>
        </div>
        <HotspotStats id={id} speciesTotal={hotspot.species} />
        <HotspotFavs hotspotId={id} />

        {canEdit && !isSaved && (
          <button
            type="button"
            onClick={handleSave}
            className="w-full text-left bg-sky-50 rounded-sm px-2 py-2 border text-sm font-bold border-sky-100 text-sky-600 mt-4 flex items-center gap-2"
          >
            <Icon name="plus" className="text-lg text-sky-600" /> Add to trip
          </button>
        )}

        {isSaved && (
          <InputNotes key={id} value={notes} onBlur={(value) => saveNotesMutation.mutate({ notes: value })} />
        )}

        {isSaved && canEdit && trip?.itinerary && trip.itinerary.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-bold text-gray-700 mb-2">Add to itinerary</h4>
            <ul className="flex flex-col gap-1.5">
              {trip.itinerary.map((day, index) => {
                const dayNumber = index + 1;
                const stopCount = day.locations?.length ?? 0;
                const isAlreadyOnDay = day.locations?.some((loc) => loc.locationId === id);
                const dateLabel = trip?.startDate
                  ? dayjs(trip.startDate).add(index, "day").format("ddd, MMM D")
                  : null;
                const dayStopTooltip =
                  day.locations
                    ?.map((loc, i) => {
                      const spot = trip?.hotspots?.find((h) => h.id === loc.locationId);
                      const marker = trip?.markers?.find((m) => m.id === loc.locationId);
                      const name = spot?.name ?? marker?.name ?? "Unknown";
                      return `${i + 1}. ${name}`;
                    })
                    .join("\n") ?? "";
                return (
                  <li key={day.id} className="flex items-center justify-between gap-2 text-sm">
                    <span
                      className="text-gray-600 cursor-help"
                      title={dayStopTooltip || "No stops yet"}
                    >
                      Day {dayNumber}
                      {dateLabel && ` · ${dateLabel}`} ({stopCount} {stopCount === 1 ? "stop" : "stops"})
                    </span>
                    {isAlreadyOnDay ? (
                      <span className="text-gray-400 text-xs">Already on Day {dayNumber}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          addToItineraryMutation.mutate({
                            dayId: day.id,
                            locationEntryId: nanoId(6),
                            dayIndex: dayNumber,
                          })
                        }
                        disabled={addToItineraryMutation.isPending}
                        className="text-sky-600 font-medium hover:underline disabled:opacity-60"
                      >
                        Add to Day {dayNumber}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="-mx-4 sm:-mx-6 mb-3">
          <nav className="mt-6 flex gap-4 bg-gray-100 px-6">
            {tabs.map(({ label, id, title }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={clsx(
                  "text-sm font-medium text-gray-900 border-b-2 transition-colors pb-3 pt-3",
                  tab === id ? "border-gray-500" : "border-transparent hover:border-gray-500"
                )}
                title={title}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="sm:-mx-1.5">
          {tab === "needs" && <RecentSpeciesList locId={id} onSpeciesClick={() => setTab("checklists")} />}
          {tab === "checklists" && (
            <RecentChecklistList
              hotspotId={id}
              speciesCode={selectedSpecies?.code}
              speciesName={selectedSpecies?.name}
            />
          )}
          <div className={clsx(tab === "targets" ? "block" : "hidden")}>
            <HotspotTargets hotspotId={id} onSpeciesClick={() => setTab("checklists")} onAddToTrip={handleSave} />
          </div>
        </div>
      </Body>
    </>
  );
}
