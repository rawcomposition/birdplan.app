import React from "react";
import { Header, Body } from "providers/modals";
import Input from "components/Input";
import { useModal } from "providers/modals";
import useFetchHotspots from "hooks/useFetchHotspots";
import { useTrip } from "providers/trip";
import { Hotspot } from "lib/types";
import Check from "icons/Check";
import clsx from "clsx";

export default function AddHotspot() {
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const { open } = useModal();
  const { trip, appendHotspot } = useTrip();
  const { hotspots } = useFetchHotspots(true);

  const results =
    query?.length > 1
      ? hotspots?.filter(
          (it) => it.name.toLowerCase().includes(query.toLowerCase()) || it.id.toLowerCase() === query.toLowerCase()
        )
      : [];

  const slicedResults = results.slice(0, 10);

  const selectHotspot = (hotspot: Hotspot, isSaved: boolean) => {
    if (!isSaved) {
      appendHotspot(hotspot);
    }
    open("hotspot", { hotspot });
  };

  const resultsRef = React.useRef(slicedResults);
  const tripHotspotsRef = React.useRef(trip?.hotspots);
  const selectedIndexRef = React.useRef(selectedIndex);
  resultsRef.current = slicedResults;
  tripHotspotsRef.current = trip?.hotspots;
  selectedIndexRef.current = selectedIndex;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        setSelectedIndex((prev) => {
          if (prev < resultsRef.current.length - 1) return prev + 1;
          return prev;
        });
      }
      if (e.key === "ArrowUp") {
        setSelectedIndex((prev) => {
          if (prev > 0) return prev - 1;
          return prev;
        });
      }
      if (e.key === "Enter") {
        const selected = resultsRef.current[selectedIndexRef.current];
        if (selected) {
          selectHotspot(selected, !!tripHotspotsRef.current?.find((it) => it.id === selected.id));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Header>Add eBird Hotspot</Header>
      <Body>
        <div className="flex gap-2 mb-2">
          <div className="flex flex-col gap-5 w-full">
            <Input
              type="search"
              name="query"
              placeholder="Search by name or ID"
              value={query}
              autoFocus
              onChange={(e: any) => setQuery(e.target.value)}
            />
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
                        <Check />
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
