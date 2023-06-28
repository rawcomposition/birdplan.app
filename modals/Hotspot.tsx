import React from "react";
import { Body } from "providers/modals";
import { Hotspot as HotspotT } from "lib/types";
import Button from "components/Button";
import Feather from "icons/Feather";
import Star from "icons/Star";
import StarOutline from "icons/StarOutline";
import toast from "react-hot-toast";
import { useTrip } from "providers/trip";
import ObsList from "components/ObsList";
import DirectionsButton from "components/DirectionsButton";
import { translate, isRegionEnglish } from "lib/helpers";
import RecentSpeciesList from "components/RecentSpeciesList";
import HotspotStats from "components/HotspotStats";
import useFetchRecentChecklists from "hooks/useFetchRecentChecklists";
import RecentChecklistList from "components/RecentChecklistList";
import clsx from "clsx";
import InputNotes from "components/InputNotes";

type Props = {
  hotspot: HotspotT;
  speciesName?: string;
};

export default function Hotspot({ hotspot, speciesName }: Props) {
  const {
    trip,
    canEdit,
    appendHotspot,
    removeHotspot,
    saveHotspotNotes,
    selectedSpeciesCode,
    setTranslatedHotspotName,
    resetTranslatedHotspotName,
  } = useTrip();
  const { id, lat, lng } = hotspot;
  const savedHotspot = trip?.hotspots.find((it) => it.id === id);
  const isSaved = !!savedHotspot;
  const name = savedHotspot?.name || hotspot.name;
  const notes = savedHotspot?.notes;
  const originalName = savedHotspot?.originalName;
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [tab, setTab] = React.useState(speciesName ? "reports" : "needs");
  const { recentChecklists } = useFetchRecentChecklists(id);

  const tabs = [
    {
      label: "Recent Needs",
      id: "needs",
    },
    {
      label: "Checklists",
      id: "checklists",
    },
  ];

  if (speciesName) {
    tabs.unshift({
      label: `${speciesName} Reports`,
      id: "reports",
    });
  }

  const handleSave = async () => {
    if (isSaved) {
      if (notes && !confirm("Are you sure you want to unsave this hotspot? Your notes will be lost.")) return;
      removeHotspot(id);
    } else {
      toast.success("Hotspot saved!");
      appendHotspot({ ...hotspot, species: hotspot.species || 0 });
    }
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    const translatedName = await translate(name);
    setIsTranslating(false);
    if (!translatedName) return;
    if (translatedName === name) {
      toast("No translation found");
      return;
    }
    setTranslatedHotspotName(id, translatedName);
  };

  const canTranslate = isSaved && !isRegionEnglish(trip?.region || "");

  return (
    <>
      <div className="pl-4 sm:pl-6 pr-12 py-4 border-b bg-gray-50">
        <h3 className="text-lg font-medium">{name}</h3>
        {canTranslate && (
          <div className="mt-0.5 text-[12px]">
            {!originalName && !isTranslating && (
              <button type="button" className="block text-sky-600" onClick={handleTranslate}>
                Translate
              </button>
            )}
            {isTranslating && <div className="text-gray-400">Translating...</div>}
            {originalName && (
              <div className="text-gray-500">
                Original: {originalName} -{" "}
                <button type="button" className="text-sky-600" onClick={() => resetTranslatedHotspotName(id)}>
                  Reset
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Body className="pb-10 sm:pb-4">
        <div className="flex gap-2 mb-6">
          <Button
            href={`https://ebird.org/targets?r1=${id}&bmo=1&emo=12&r2=world&t2=life`}
            target="_blank"
            color="gray"
            size="sm"
          >
            <Feather className="mr-1 -mt-[3px] text-[#1c6900]" /> Targets
          </Button>
          <DirectionsButton lat={lat} lng={lng} hotspotId={id} />
          {canEdit && (
            <Button color="gray" size="sm" onClick={handleSave}>
              {isSaved ? (
                <>
                  <Star className="mr-1 -mt-[3px] text-sky-600" /> Saved
                </>
              ) : (
                <>
                  <StarOutline className="mr-1 -mt-[3px] text-sky-600" /> Save
                </>
              )}
            </Button>
          )}
        </div>
        <HotspotStats id={id} speciesTotal={hotspot.species} checklists={recentChecklists} />
        {isSaved && <InputNotes value={notes} onBlur={(value) => saveHotspotNotes(id, value)} />}
        <div className="-mx-4 sm:-mx-6 mb-3">
          <nav className="mt-6 flex gap-4 bg-gray-100 px-6">
            {tabs.map(({ label, id }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={clsx(
                  "text-sm font-medium text-gray-900 border-b-2 transition-colors pb-3 pt-3",
                  tab === id ? "border-gray-500" : "border-transparent hover:border-gray-500"
                )}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="-mx-1.5">
          {tab === "reports" && (
            <ObsList locId={id} speciesCode={selectedSpeciesCode || ""} recentChecklists={recentChecklists} />
          )}
          {tab === "needs" && <RecentSpeciesList locId={id} />}
          {tab === "checklists" && <RecentChecklistList checklists={recentChecklists} />}
        </div>
      </Body>
    </>
  );
}
