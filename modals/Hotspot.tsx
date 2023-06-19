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
import TextareaAutosize from "react-textarea-autosize";
import DirectionsButton from "components/DirectionsButton";
import { translate, isRegionEnglish } from "lib/helpers";
import RecentSpeciesList from "components/RecentSpeciesList";
import HotspotStats from "components/HotspotStats";

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
    saveNotes,
    selectedSpeciesCode,
    setTranslatedHotspotName,
    resetTranslatedHotspotName,
  } = useTrip();
  const { id, lat, lng } = hotspot;
  const savedHotspot = trip?.hotspots.find((it) => it.id === id);
  const isSaved = !!savedHotspot;
  const name = savedHotspot?.name || hotspot.name;
  const originalName = savedHotspot?.originalName;
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [notes, setNotes] = React.useState(trip?.hotspots.find((it) => it.id === id)?.notes);
  const [isEditing, setIsEditing] = React.useState(isSaved && !notes && canEdit);

  const handleSave = async () => {
    if (isSaved) {
      if (notes && !confirm("Are you sure you want to unsave this hotspot? Your notes will be lost.")) return;
      removeHotspot(id);
    } else {
      toast.success("Hotspot saved!");
      appendHotspot({ ...hotspot, species: hotspot.species || 0 });
      if (!notes) setIsEditing(true);
    }
  };

  const handleSaveNotes = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    saveNotes(id, e.target.value);
  };

  const showNotes = isSaved && (isEditing || notes || canEdit);
  const showToggleBtn = canEdit && ((isEditing && !!notes) || !isEditing);

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
      <Body className="max-h-[65vh] sm:max-h-full pb-10 sm:pb-4 relative min-h-[240px]">
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
        <HotspotStats id={id} speciesTotal={hotspot.species} />
        {showNotes && (
          <>
            <div className="flex items-center gap-3 mt-6">
              <h3 className="text-gray-700 font-bold">Notes</h3>
              {showToggleBtn && (
                <button
                  type="button"
                  onClick={() => setIsEditing((isEditing) => !isEditing)}
                  className="text-sky-600 text-[13px] font-bold px-2 border border-sky-600 rounded hover:text-sky-700 hover:border-sky-700 transition-colors"
                >
                  {isEditing ? "Done" : "Edit"}
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="-mx-2">
                <TextareaAutosize
                  className="mt-1 input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleSaveNotes}
                  minRows={2}
                  maxRows={15}
                />
              </div>
            ) : (
              <div className="mt-1 text-gray-700 text-sm relative group">{notes || "No notes"}</div>
            )}
          </>
        )}
        {selectedSpeciesCode && <ObsList locId={id} speciesCode={selectedSpeciesCode} speciesName={speciesName} />}
        {!selectedSpeciesCode && <RecentSpeciesList locId={id} />}
      </Body>
    </>
  );
}
