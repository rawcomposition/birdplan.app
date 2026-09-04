import React from "react";
import { Header, Body } from "components/Modal";
import { SavedHotspotInput, SavedHotspotListsInput } from "@birdplan/shared";
import { Button } from "components/ui/button";
import { useTrip } from "hooks/useTrip";
import DirectionsButton from "components/DirectionsButton";
import { getMarkerColor } from "lib/helpers";
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
import useOpenBirdingHotspot from "hooks/useOpenBirdingHotspot";
import SaveToListsMenu from "components/SaveToListsMenu";
import useHotspotLists from "hooks/useHotspotLists";

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
  const { setSelectedMarkerId, setHalo } = useTrip();
  const { savedHotspots } = useSavedHotspots();
  const { lists } = useHotspotLists();
  const { data: info, isLoading } = useOpenBirdingHotspot(hotspotId);
  const [modalSpecies, setModalSpecies] = React.useState<{
    code: string;
    name: string;
  }>();
  const [tab, setTab] = React.useState("targets");

  const saved = savedHotspots.find((it) => it.hotspotId === hotspotId);
  const isSaved = !!saved;
  const name = info?.name || saved?.name || (isLoading ? "Loading..." : hotspotId);
  const speciesTotal = info?.numSpecies ?? saved?.species ?? species;
  const checklistsTotal = info?.numChecklists ?? saved?.checklists;

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
  });

  const listsMutation = useSavedHotspotMutation<SavedHotspotListsInput>({
    url: `/saved-hotspots/${hotspotId}/lists`,
    method: "PATCH",
    updateCache: (old, input) =>
      input.listIds.length === 0
        ? old.filter((it) => it.hotspotId !== hotspotId)
        : old.map((it) => (it.hotspotId === hotspotId ? { ...it, listIds: input.listIds } : it)),
  });

  const notesMutation = useSavedHotspotMutation<{ notes: string }>({
    url: `/saved-hotspots/${hotspotId}/notes`,
    method: "PATCH",
    updateCache: (old, input) => old.map((it) => (it.hotspotId === hotspotId ? { ...it, notes: input.notes } : it)),
  });

  const handleChange = (listIds: string[]) => {
    if (isSaved) {
      if (
        listIds.length === 0 &&
        saved?.notes &&
        !confirm("Removing this hotspot from all lists will delete your notes. Continue?")
      )
        return;
      listsMutation.mutate({ listIds });
      return;
    }
    saveMutation.mutate({
      hotspotId,
      name: info?.name || name,
      lat: info?.lat ?? lat,
      lng: info?.lng ?? lng,
      species: speciesTotal ?? undefined,
      checklists: checklistsTotal ?? undefined,
      listIds: listIds.length > 0 ? listIds : lists.slice(0, 1).map((it) => it._id),
    });
  };

  React.useEffect(() => {
    if (isSaved) {
      setHalo(undefined);
    } else {
      setHalo({ lat, lng, color: getMarkerColor(species || 0) });
    }
    setSelectedMarkerId(hotspotId);
    return () => {
      setSelectedMarkerId(undefined);
      setHalo(undefined);
    };
  }, [hotspotId, lat, lng, isSaved, species]);

  return (
    <>
      <Header>{name}</Header>
      <Body className="pb-10 sm:pb-4 relative">
        <div className="flex gap-2 mb-6">
          <SaveToListsMenu saved={saved} disabled={!isSaved && !info} onChange={handleChange} />
          <DirectionsButton lat={lat} lng={lng} hotspotId={hotspotId} />
          <Button variant="outline-white" size="sm" href={`https://ebird.org/hotspot/${hotspotId}`} target="_blank">
            <img src="/ebird.png" width={48} />
          </Button>
          <DropdownMenu>
            <KebabMenuTrigger />
            <DropdownMenuContent align="end" className="w-[170px]">
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

        {isSaved && (
          <InputNotes
            key={hotspotId}
            value={saved?.notes}
            canEdit
            onBlur={(value) => notesMutation.mutate({ notes: value })}
          />
        )}
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
