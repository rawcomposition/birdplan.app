import React from "react";
import { Body } from "components/Modal";
import { HotspotInput, Hotspot as HotspotT, Trip } from "@birdplan/shared";
import { Button } from "components/ui/button";
import toast from "react-hot-toast";
import { useTrip } from "hooks/useTrip";
import DirectionsButton from "components/DirectionsButton";
import { isRegionEnglish, getMarkerColor } from "lib/helpers";
import RecentSpeciesList from "components/RecentSpeciesList";
import HotspotStats from "components/HotspotStats";
import RecentChecklistList from "components/RecentChecklistList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "components/ui/tabs";
import InputNotes from "components/InputNotes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import HotspotTargets from "components/HotspotTargets";
import HotspotFavs from "components/HotspotFavs";
import Icon from "components/Icon";
import { useLocation } from "react-router-dom";
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

  return (
    <>
      <div className="pl-4 sm:pl-6 pr-12 py-4 border-b bg-gray-50">
        <h3 className="text-lg font-medium">{name}</h3>
        {canTranslate && (
          <div className="mt-0.5 text-[12px]">
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
      </div>
      <Body className="pb-10 sm:pb-4 relative">
        <div className="flex gap-2 mb-6">
          <Button
            variant="outline-white"
            size="toolbar"
            href={`https://ebird.org/targets?r1=${id}&bmo=1&emo=12&r2=world&t2=life`}
            target="_blank"
          >
            <Icon name="feather" className="text-success" /> Targets
          </Button>
          <DirectionsButton lat={lat} lng={lng} hotspotId={id} />
          <Button
            variant="outline-white"
            size="toolbar"
            href={`https://ebird.org/hotspot/${id}`}
            target="_blank"
          >
            <img src="/ebird.png" width={48} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline-white" size="icon-lg" />}>
              <Icon name="verticalDots" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[170px]">
              <DropdownMenuItem
                render={<a href={`https://ebird.org/hotspot/${id}/media?yr=all&m=`} target="_blank" rel="noreferrer" />}
              >
                Illustrated Checklist
              </DropdownMenuItem>
              {canEdit && isSaved && (
                <DropdownMenuItem variant="destructive" onClick={handleSave}>
                  Remove from trip
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <HotspotStats id={id} speciesTotal={hotspot.species} checklistsTotal={hotspot.checklists} />
        <HotspotFavs hotspotId={id} />

        {canEdit && !isSaved && (
          <button
            type="button"
            onClick={handleSave}
            className="w-full text-left bg-sky-50 rounded-sm px-2 py-2 border text-sm font-bold border-sky-100 text-link mt-4 flex items-center gap-2"
          >
            <Icon name="plus" className="text-lg text-link" /> Add to trip
          </button>
        )}

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
