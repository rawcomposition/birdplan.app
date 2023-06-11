import React from "react";
import Header from "components/Header";
import Head from "next/head";
import LoginModal from "components/LoginModal";
import { LocationValue, BFTarget, BFHotspot, Option } from "lib/types";
import { useProfile } from "providers/profile";
import Button from "components/Button";
import Sidebar from "components/Sidebar";
import { useUI } from "providers/ui";
import LocationSelect from "components/LocationSelect";
import MonthSelect from "components/MonthSelect";
import { toast } from "react-hot-toast";
import Expand from "components/Expand";
import { useModal } from "providers/modals";
import BirdFinderSpeciesRow from "components/BirdFinderSpeciesRow";
import BirdFinderHotspotRow from "components/BirdFinderHotspotRow";
import XMark from "icons/XMark";

export default function Targets() {
  const [location, setLocation] = React.useState<LocationValue | null>(null);
  const [month, setMonth] = React.useState<Option>();
  const [radius, setRadius] = React.useState("25");
  const [loading, setLoading] = React.useState(false);
  const [hideSeen, setHideSeen] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState<string>();
  const [selectedName, setSelectedName] = React.useState<string>();
  const [noResults, setNoResults] = React.useState(false);

  const { lifelist } = useProfile();
  const { closeSidebar } = useUI();
  const { open } = useModal();
  const [results, setResults] = React.useState<BFTarget[]>([]);
  const [hotspots, setHotspots] = React.useState<BFHotspot[]>([]);
  const lat = 20.65451688;
  const lng = -105.2252072;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!lat || !lng) {
      toast.error("Location is required");
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Loading...");
    setSelectedId(undefined);
    setSelectedName(undefined);
    setNoResults(false);
    try {
      const res = await fetch(`/api/targets?lat=${lat}&lng=${lng}&radius=${radius || 25}&month=${month?.value || 0}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      setResults(json.results);
      setNoResults(json.results.length === 0);
    } catch (err) {
      toast.error("Error fetching results");
    }
    setLoading(false);
    toast.dismiss(toastId);
  };

  const onSelect = async (id: string, name: string) => {
    if (!lat || !lng) {
      toast.error("Location is required");
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Loading...");
    setSelectedId(id);
    setSelectedName(name);
    try {
      const res = await fetch(
        `/api/target-hotspots?lat=${lat}&lng=${lng}&radius=${radius || 25}&month=${month?.value || 0}&id=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const json = await res.json();
      setHotspots(json.results);
    } catch (err) {
      toast.error("Error fetching results");
    }
    setLoading(false);
    toast.dismiss(toastId);
  };

  const clearSelected = () => {
    setSelectedId(undefined);
    setSelectedName(undefined);
    setHotspots([]);
  };

  const filtered = hideSeen ? results.filter((result) => !lifelist.some((code) => code === result.code)) : results;

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Bird Planner</title>
      </Head>

      <Header title="Bird Finder" />
      <main className="flex h-[calc(100%-60px)]">
        <Sidebar>
          <div className="mb-4">
            <label className="text-white text-sm">
              <input type="checkbox" className="mr-2" checked={hideSeen} onChange={() => setHideSeen(!hideSeen)} />
              &nbsp; Hide species I&apos;ve seen
            </label>
          </div>
          <div className="-mx-6 mb-8">
            <Expand heading="US Life List" count={lifelist?.length} className="text-white">
              <Button size="sm" color="primary" onClick={() => open("uploadLifelist")}>
                Import Life List
              </Button>
            </Expand>
          </div>
        </Sidebar>
        <div className="px-12 py-12 flex-grow h-full overflow-auto" onClick={closeSidebar}>
          <form className="grid gap-4 grid-cols-2 sm:grid-cols-3 max-w-xl mx-auto mb-12" onSubmit={onSubmit}>
            <LocationSelect value={location} onChange={setLocation} className="col-span-full" />
            <div className="flex">
              <label
                className="px-3 border border-gray-300 border-r-0 focus:ring-slate-500 focus:border-slate-500 outline-blue-500 flex shadow-sm text-sm rounded-l-md outline-offset-0 whitespace-nowrap items-center justify-center bg-gray-200 h-full"
                htmlFor="radius"
              >
                Radius (mi)
              </label>
              <input
                id="radius"
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="py-2 px-3 border border-gray-300 focus:ring-slate-500 focus:border-slate-500 w-full outline-blue-500 block shadow-sm sm:text-sm rounded-r-md rounded-l-none outline-offset-0"
              />
            </div>
            <MonthSelect value={month} onChange={setMonth} placeholder="All Months" isClearable />
            <Button type="submit" color="primary" size="md" disabled={loading}>
              Find
            </Button>
          </form>
          {selectedId && (
            <div className="text-gray-600 text-[15px] flex items-center gap-2 sm:col-span-3 mb-4">
              <p>
                Viewing hotspots for <span className="font-bold">{selectedName}</span>
              </p>
              <button
                type="button"
                className="text-[12px] px-2 py-0.5 bg-blue-500 text-white hover:bg-blue-600 transition-colors rounded-full whitespace-nowrap"
                onClick={clearSelected}
              >
                <XMark className="text-[11px] mr-1" />
                Clear
              </button>
            </div>
          )}
          <div>
            {!selectedId && noResults && <p className="my-12 text-gray-700 text-center text-lg">No results found</p>}
            {!selectedId &&
              filtered.map((it, index) => (
                <BirdFinderSpeciesRow key={it.id} {...it} index={index} onSelect={onSelect} />
              ))}
            {selectedId &&
              hotspots.map((it, index) => <BirdFinderHotspotRow key={it.locationId} {...it} index={index} />)}
          </div>
          {(!!results.length || !!hotspots.length) && (
            <p className="text-sm text-gray-500 mt-12">
              Data retrieved from{" "}
              <a href="https://www.michaelfogleman.com/birds/">Michael Fogleman&apos;s Bird Finder</a>
            </p>
          )}
        </div>
      </main>

      <LoginModal />
    </div>
  );
}
