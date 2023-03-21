import React from "react";
import { Header, Body } from "providers/modals";
import { Hotspot as HotspotT } from "lib/types";
import Button from "components/Button";
import Feather from "icons/Feather";
import Directions from "icons/Directions";
import Star from "icons/Star";
import StarOutline from "icons/StarOutline";
import toast from "react-hot-toast";
import { useTrip } from "providers/trip";
import ObsList from "components/ObsList";
import Input from "components/Input";

type Props = {
  hotspot: HotspotT;
  speciesName?: string;
};

type Info = {
  checklists: number;
  species: number;
};

export default function Hotspot({ hotspot, speciesName }: Props) {
  const { trip, appendHotspot, removeHotspot, saveNotes, selectedSpeciesCode } = useTrip();
  const [info, setInfo] = React.useState<Info>();
  const { id, name, lat, lng } = hotspot;
  const isSaved = trip?.hotspots.some((it) => it.id === id);
  const notes = trip?.hotspots.find((it) => it.id === id)?.notes;

  const handleSave = async () => {
    if (isSaved) {
      if (notes && !confirm("Are you sure you want to unsave this hotspot? Your notes will be lost.")) return;
      removeHotspot(id);
    } else {
      toast.success("Hotspot saved!");
      appendHotspot({ ...hotspot, species: hotspot.species || info?.species || 0 });
    }
  };

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/hotspot-info?id=${id}`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        setInfo({ checklists: json.numChecklists, species: json.numSpecies });
      } catch (err) {
        console.log(err);
      }
    })();
  }, [id]);

  const handleSaveNotes = async (e: React.ChangeEvent<HTMLInputElement>) => {
    saveNotes(id, e.target.value);
  };

  return (
    <>
      <Header>{name}</Header>
      <Body>
        <div className="flex gap-2 mb-4">
          <Button
            href={`https://ebird.org/targets?r1=${id}&bmo=1&emo=12&r2=world&t2=life`}
            target="_blank"
            color="gray"
            size="sm"
          >
            <Feather className="mr-1 -mt-[3px] text-[#1c6900]" /> Targets
          </Button>
          <Button
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            color="gray"
            size="sm"
          >
            <Directions className="mr-1 -mt-[3px] text-[#c2410d]" /> Directions
          </Button>
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
        </div>
        <div className="flex gap-10 text-gray-500">
          <div className="flex flex-col text-[#1c6900]">
            <span className="text-3xl font-bold">{hotspot.species || info?.species || "--"}</span>
            <span className="text-xs">Species</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{info?.checklists?.toLocaleString() || "--"}</span>
            <span className="text-xs">Checklists</span>
          </div>
        </div>
        {isSaved && (
          <Input isTextarea placeholder="Notes" className="mt-4" defaultValue={notes} onBlur={handleSaveNotes} />
        )}
        {selectedSpeciesCode && <ObsList locId={id} speciesCode={selectedSpeciesCode} speciesName={speciesName} />}
      </Body>
    </>
  );
}
