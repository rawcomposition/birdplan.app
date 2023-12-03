import React from "react";
import { useTrip } from "providers/trip";
import Button from "components/Button";
import Download from "icons/Download";
import useHotspotTargets from "hooks/useHotspotTargets";
import toast from "react-hot-toast";
import { parseTargets } from "lib/helpers";
import HotspotTargetRow from "components/HotspotTargetRow";
import FilterTabs from "components/FilterTabs";
import { useProfile } from "providers/profile";
import { deleteTargets } from "lib/firebase";
import XMarkCircle from "icons/XMarkCircle";

type Props = {
  locId: string;
  tripRangeLabel: string;
  onSpeciesClick: () => void;
};

export default function HotspotTargets({ locId, tripRangeLabel, onSpeciesClick }: Props) {
  const { lifelist } = useProfile();
  const [view, setView] = React.useState<string>("all");
  const { trip, setHotspotTargetsId, setSelectedSpecies } = useTrip();
  const hotspot = trip?.hotspots.find((it) => it.id === locId);
  const hasTargets = !!hotspot?.targetsId;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { addTargets, items, isLoading } = useHotspotTargets(locId);
  const startMonth = trip?.startMonth || 1;
  const endMonth = trip?.endMonth || 12;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!trip) return;
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.name?.includes(locId)) {
        toast.error("The file you selected is not for this hotspot");
        return;
      }
      const toastId = toast.loading("Importing...");
      const res = await parseTargets({ file, startMonth, endMonth });
      addTargets({ ...res, tripId: trip.id, hotspotId: locId });
      toast.success("Targets imported");
      toast.dismiss(toastId);
    } catch (error) {
      console.error(error);
      toast.error("Error processing file");
      fileInputRef.current?.value && (fileInputRef.current.value = "");
    }
  };

  const sortedItems = React.useMemo(() => {
    if (!items?.length) return [];
    const needs = items.filter((it) => !lifelist?.includes(it.code));
    const filtered = view === "all" ? needs.filter((it) => it.percentYr >= 5) : needs.filter((it) => it.percent >= 5);
    return view === "all"
      ? filtered.sort((a, b) => b.percentYr - a.percentYr)
      : filtered.sort((a, b) => b.percent - a.percent);
  }, [items, view, lifelist]);

  const hasResults = !!items?.length;

  const handleReset = async () => {
    if (!confirm("Are you sure? Target data will be cleared and you will need to re-upload the CSV file.")) return;
    await deleteTargets(locId);
    await setHotspotTargetsId(locId, "");
  };

  if (!hasTargets) {
    return (
      <>
        <div className="mb-8">
          <h3 className="text-md font-medium mb-2 text-gray-700">1. Download targets from eBird</h3>
          <Button
            href={`https://ebird.org/barchartData?r=${locId}&bmo=1&emo=12&byr=1900&eyr=2023&fmt=tsv`}
            target="_blank"
            color="primary"
            size="xs"
            className="inline-flex items-center gap-2"
          >
            <Download /> Download Targets
          </Button>
          <p className="bg-amber-100 text-amber-800 p-2 rounded text-[12px] mt-2">
            <strong>Note:</strong> Your{" "}
            <a href="https://ebird.org/prefs" className="text-sky-600" target="_blank" rel="noreferrer">
              eBird Preferences
            </a>{" "}
            must be set to show species names in <strong>English</strong> or <strong>English (US)</strong> for this to
            work.
          </p>
        </div>
        <div className="mb-8">
          <h3 className="text-md font-medium mb-2 text-gray-700">2. Upload the CSV file</h3>
          <input ref={fileInputRef} type="file" accept=".txt" className="text-xs" onChange={handleFileUpload} />
        </div>
      </>
    );
  }

  return (
    <>
      {hasResults && (
        <FilterTabs
          className="my-4"
          value={view}
          onChange={setView}
          options={[
            { label: "All Year", value: "all" },
            { label: tripRangeLabel, value: "obs" },
          ]}
        />
      )}
      {!sortedItems?.length && <p className="text-gray-500 text-sm">No targets found &gt; 5%</p>}
      {isLoading && <p className="text-gray-500 text-sm">Loading...</p>}
      {sortedItems.map((it, index) => (
        <HotspotTargetRow
          key={it.code}
          {...it}
          index={index}
          view={view}
          locId={locId}
          range={tripRangeLabel}
          onClick={() => {
            setSelectedSpecies({ code: it.code, name: it.name });
            onSpeciesClick();
          }}
        />
      ))}
      <div className="flex items-center justify-between">
        <a
          href={
            view === "all"
              ? `https://ebird.org/targets?r1=${locId}&bmo=1&emo=12&r2=world&t2=life`
              : `https://ebird.org/targets?r1=${locId}&bmo=${trip?.startMonth}&emo=${trip?.endMonth}&r2=world&t2=life`
          }
          target="_blank"
          rel="noreferrer"
          className="text-sky-600 text-[12px] font-bold pr-3 py-1"
        >
          View on eBird
        </a>
        <button
          type="button"
          className="text-sky-600 text-[12px] font-bold pl-3 py-1 inline-flex items-center gap-1"
          onClick={handleReset}
        >
          <XMarkCircle />
          Reset Targets
        </button>
      </div>
    </>
  );
}
