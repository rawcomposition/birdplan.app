import React from "react";
import { Header, Body } from "components/Modal";
import { Input } from "components/ui/input";
import { useModal } from "stores/modals";
import useFetchHotspots from "hooks/useFetchHotspots";
import { useTrip } from "hooks/useTrip";
import { eBirdHotspot, HotspotInput } from "@birdplan/shared";
import Icon from "components/Icon";
import { Button } from "components/ui/button";
import clsx from "clsx";
import useTripMutation from "hooks/useTripMutation";

export default function AddHotspot() {
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const { open, close } = useModal();
  const { trip, showAllHotspots, setShowAllHotspots } = useTrip();
  const { hotspots } = useFetchHotspots();

  const addHotspotMutation = useTripMutation<HotspotInput>({
    url: `/trips/${trip?._id}/hotspots`,
    method: "POST",
    updateCache: (old, input) => ({
      ...old,
      hotspots: [...(old.hotspots || []), input],
    }),
  });

  const results =
    query?.length > 1
      ? hotspots?.filter(
          (it) => it.name.toLowerCase().includes(query.toLowerCase()) || it.id.toLowerCase() === query.toLowerCase()
        )
      : [];

  const slicedResults = results.slice(0, 10);

  const selectHotspot = (hotspot: eBirdHotspot, isSaved: boolean) => {
    if (!isSaved) {
      addHotspotMutation.mutate({ ...hotspot, species: hotspot.species || 0, checklists: hotspot.checklists || 0 });
    }
    open("hotspot", { hotspot });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < slicedResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = slicedResults[selectedIndex];
      if (selected) {
        selectHotspot(selected, !!trip?.hotspots?.find((it) => it.id === selected.id));
      }
    }
  };

  return (
    <>
      <Header>Add eBird Hotspot</Header>
      <Body>
        <div className="flex gap-2 mb-2" onKeyDown={handleKeyDown}>
          <div className="flex flex-col gap-5 w-full">
            <Input size="sm"
              type="search"
              name="query"
              placeholder="Search by name or ID"
              value={query}
              autoFocus
              onChange={(e: any) => setQuery(e.target.value)}
            />
            {!showAllHotspots && (
              <p className="text-[12px] text-gray-700 -mt-3">
                <Button
                  variant="link"
                  type="button"
                  onClick={() => {
                    setShowAllHotspots(true);
                    close();
                  }}
                >
                  Or view hotspot map
                </Button>
              </p>
            )}
            <div className="flex flex-col gap-2">
              {!!slicedResults?.length && <p className="text-[13px] text-gray-600">Select a hotspot to add</p>}
              {slicedResults.map((it, index) => {
                const isSaved = !!trip?.hotspots.find((hotspot) => hotspot.id === it.id);
                const isSelected = selectedIndex === index;
                return (
                  <button
                    key={it.id}
                    onClick={() => selectHotspot(it, isSaved)}
                    className={clsx(
                      "flex gap-4 items-center justify-between text-left py-2 px-3 border border-transparent hover:bg-blue-100/40 rounded-md hover:border-blue-100",
                      isSelected && "bg-blue-100/40 border-blue-100"
                    )}
                  >
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{it.name}</span>
                      <span className="text-xs text-gray-500">
                        {it.id}&nbsp;&nbsp;•&nbsp;&nbsp;{it.species} species
                      </span>
                    </span>
                    {isSaved && (
                      <span className="flex flex-col text-green-600 items-center text-sm">
                        <Icon name="check" />
                        <span className="uppercase text-[9px]">Added</span>
                      </span>
                    )}
                  </button>
                );
              })}
              {query?.length > 1 && (
                <p className="text-xs text-gray-500">
                  Showing {slicedResults.length} of {results.length} results
                </p>
              )}
            </div>
          </div>
        </div>
      </Body>
    </>
  );
}
