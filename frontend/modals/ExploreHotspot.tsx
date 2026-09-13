import React from "react";
import { Header, Body } from "components/Modal";
import { SavedHotspotInput, SavedHotspotListsInput, SavedHotspotNotesInput } from "@birdplan/shared";
import { Button } from "components/ui/button";
import { useTrip } from "hooks/useTrip";
import DirectionsButton from "components/DirectionsButton";
import RecentSpeciesList from "components/RecentSpeciesList";
import HotspotStats from "components/HotspotStats";
import RecentChecklistList from "components/RecentChecklistList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "components/ui/tabs";
import InputNotes from "components/InputNotes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "components/ui/dropdown-menu";
import KebabMenuTrigger from "components/KebabMenuTrigger";
import HotspotTargets from "components/HotspotTargets";
import useSavedHotspots from "hooks/useSavedHotspots";
import useSavedHotspotMutation from "hooks/useSavedHotspotMutation";
import useHiddenHotspots from "hooks/useHiddenHotspots";
import useHiddenHotspotMutation from "hooks/useHiddenHotspotMutation";
import useOpenBirdingHotspot from "hooks/useOpenBirdingHotspot";
import SaveToListsMenu from "components/SaveToListsMenu";
import useHotspotLists from "hooks/useHotspotLists";
import DeletedHotspotNotice from "components/DeletedHotspotNotice";
import { useModal } from "stores/modals";
import { EyeOff } from "lucide-react";

type Props = {
  hotspotId: string;
  lat: number;
  lng: number;
  species?: number;
};

const tabs = [
  { label: "Targets", id: "targets" },
  { label: "Recent Needs", id: "needs" },
  { label: "Checklists", id: "checklists" },
];

export default function ExploreHotspot({ hotspotId, lat, lng, species }: Props) {
  const { setSelectedMarkerId } = useTrip();
  const { stack } = useModal();
  const { savedHotspots } = useSavedHotspots();
  const { hiddenIds } = useHiddenHotspots();
  const { lists } = useHotspotLists();
  const { data: info, isLoading } = useOpenBirdingHotspot(hotspotId);
  const [modalSpecies, setModalSpecies] = React.useState<{
    code: string;
    name: string;
  }>();
  const [tab, setTab] = React.useState("targets");

  const saved = savedHotspots.find((it) => it.hotspotId === hotspotId);
  const hasRow = !!saved;
  const isDeleted = !!saved?.deletedAt;
  const isHidden = hiddenIds.has(hotspotId);
  const name = info?.name || saved?.name || (isLoading ? "Loading..." : hotspotId);
  const speciesTotal = info?.numSpecies ?? species;
  const checklistsTotal = info?.numChecklists;

  const saveMutation = useSavedHotspotMutation<SavedHotspotInput>({
    url: "/saved-hotspots",
    method: "POST",
    updateCache: (old, input) => [
      {
        _id: input.hotspotId,
        userId: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        ...input,
        listIds: input.listIds || [],
      },
      ...old.filter((it) => it.hotspotId !== input.hotspotId),
    ],
    updateHiddenCache: (old) => old.filter((id) => id !== hotspotId),
  });

  const listsMutation = useSavedHotspotMutation<SavedHotspotListsInput>({
    url: `/saved-hotspots/${hotspotId}/lists`,
    method: "PATCH",
    updateCache: (old, input) =>
      old.flatMap((it) => {
        if (it.hotspotId !== hotspotId) return [it];
        if (input.listIds.length === 0 && !it.notes) return [];
        return [{ ...it, listIds: input.listIds }];
      }),
    updateHiddenCache: (old, input) => (input.listIds.length > 0 ? old.filter((id) => id !== hotspotId) : old),
  });

  const hideMutation = useHiddenHotspotMutation({
    url: `/hidden-hotspots/${hotspotId}`,
    method: "PUT",
    updateCache: (old) => [...old.filter((id) => id !== hotspotId), hotspotId],
    updateSavedCache: (old) =>
      old.flatMap((it) => {
        if (it.hotspotId !== hotspotId) return [it];
        return it.notes ? [{ ...it, listIds: [] }] : [];
      }),
  });

  const unhideMutation = useHiddenHotspotMutation({
    url: `/hidden-hotspots/${hotspotId}`,
    method: "DELETE",
    updateCache: (old) => old.filter((id) => id !== hotspotId),
  });

  const notesMutation = useSavedHotspotMutation<SavedHotspotNotesInput>({
    url: `/saved-hotspots/${hotspotId}/notes`,
    method: "PATCH",
    updateCache: (old, input) => {
      const existing = old.find((it) => it.hotspotId === hotspotId);
      if (existing) {
        return old.flatMap((it) => {
          if (it.hotspotId !== hotspotId) return [it];
          if (!input.notes && it.listIds.length === 0) return [];
          return [{ ...it, notes: input.notes }];
        });
      }
      if (!input.notes) return old;
      return [
        {
          _id: hotspotId,
          userId: "",
          hotspotId,
          name: input.name || name,
          lat: input.lat ?? lat,
          lng: input.lng ?? lng,
          species: input.species,
          notes: input.notes,
          listIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        ...old,
      ];
    },
  });

  const handleNotes = (notes: string) => {
    if (notes === (saved?.notes || "")) return;
    notesMutation.mutate({
      notes,
      name: info?.name || name,
      lat: info?.lat ?? lat,
      lng: info?.lng ?? lng,
      species: speciesTotal ?? undefined,
    });
  };

  const handleChange = (listIds: string[]) => {
    if (hasRow) {
      listsMutation.mutate({ listIds });
      return;
    }
    saveMutation.mutate({
      hotspotId,
      name: info?.name || name,
      lat: info?.lat ?? lat,
      lng: info?.lng ?? lng,
      species: speciesTotal ?? undefined,
      listIds: listIds.length > 0 ? listIds : lists.slice(0, 1).map((it) => it._id),
    });
  };

  React.useEffect(() => {
    setSelectedMarkerId(hotspotId);
    return () => setSelectedMarkerId(undefined);
  }, [hotspotId]);

  return (
    <>
      <Header>{name}</Header>
      <Body className="pb-10 sm:pb-4 relative">
        {isDeleted && <DeletedHotspotNotice onRemove={() => handleChange([])} />}
        {isHidden && (
          <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 mb-5 text-sm text-gray-600">
            <EyeOff className="size-4 text-gray-400 shrink-0" />
            <span className="grow">This hotspot is hidden.</span>
            <Button variant="outline-white" size="sm" type="button" onClick={() => unhideMutation.mutate()}>
              Unhide
            </Button>
          </div>
        )}
        <div className="flex gap-2 mb-6">
          <SaveToListsMenu saved={saved} disabled={!hasRow && !info} onChange={handleChange} />
          <DirectionsButton lat={lat} lng={lng} hotspotId={hotspotId} />
          <Button variant="outline-white" size="sm" href={`https://ebird.org/hotspot/${hotspotId}`} target="_blank">
            <img src="/ebird.png" width={48} />
          </Button>
          <DropdownMenu>
            <KebabMenuTrigger />
            <DropdownMenuContent align="end" className="w-[170px]">
              <DropdownMenuItem
                disabled={!info && !saved}
                onClick={() =>
                  stack("addToTrip", {
                    hotspots: [{ hotspotId, name: info?.name || saved?.name || name }],
                  })
                }
              >
                Save to Trip
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => (isHidden ? unhideMutation.mutate() : hideMutation.mutate())}>
                {isHidden ? "Unhide Hotspot" : "Hide Hotspot"}
              </DropdownMenuItem>
              <DropdownMenuItem
                render={
                  <a href={`https://ebird.org/hotspot/${hotspotId}/media?yr=all&m=`} target="_blank" rel="noreferrer" />
                }
              >
                Illustrated Checklist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <HotspotStats
          id={hotspotId}
          speciesTotal={speciesTotal ?? undefined}
          checklistsTotal={checklistsTotal ?? undefined}
        />

        <InputNotes key={hotspotId} value={saved?.notes} canEdit onBlur={handleNotes} />
        <Tabs value={tab} onValueChange={(value) => setTab(value as string)}>
          <div className="-mx-4 sm:-mx-6 mb-3">
            <TabsList className="mt-6 bg-gray-100 px-6">
              {tabs.map(({ label, id }) => (
                <TabsTrigger key={id} value={id}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="sm:-mx-1.5">
            <TabsContent value="needs">
              <RecentSpeciesList
                locId={hotspotId}
                onSpeciesClick={(species) => {
                  setModalSpecies(species);
                  setTab("checklists");
                }}
              />
            </TabsContent>
            <TabsContent value="checklists">
              <RecentChecklistList
                hotspotId={hotspotId}
                speciesCode={modalSpecies?.code}
                speciesName={modalSpecies?.name}
              />
            </TabsContent>
            <TabsContent value="targets" keepMounted>
              <HotspotTargets
                hotspotId={hotspotId}
                onSpeciesClick={(species) => {
                  setModalSpecies(species);
                  setTab("checklists");
                }}
                onAddToTrip={() => handleChange([])}
              />
            </TabsContent>
          </div>
        </Tabs>
      </Body>
    </>
  );
}
