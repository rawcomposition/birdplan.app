import React from "react";
import { Header, Body } from "providers/modals";
import { Hotspot } from "lib/types";
import Button from "components/Button";
import Feather from "icons/Feather";
import Directions from "icons/Directions";
import Star from "icons/Star";
import StarOutline from "icons/StarOutline";
import toast from "react-hot-toast";
import { useProfile } from "providers/profile";

type Props = {
  hotspot: Hotspot;
};

export default function StateInfo({ hotspot }: Props) {
  const { hotspots, appendHotspot, removeHotspot } = useProfile();
  const [checklistCount, setChecklistCount] = React.useState<number>();
  const { id, name, lat, lng, species } = hotspot;
  const isSaved = hotspots.some((it) => it.id === id);

  const handleSave = async () => {
    if (isSaved) {
      removeHotspot(id);
    } else {
      toast.success("Hotspot saved!");
      appendHotspot(hotspot);
    }
  };

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/hotspot-info?id=${id}`);
        const json = await res.json();
        setChecklistCount(json.numChecklists);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [id]);

  return (
    <>
      <Header>{name}</Header>
      <Body>
        <div className="flex gap-10 text-gray-500">
          <div className="flex flex-col text-[#1c6900]">
            <span className="text-3xl font-bold">{species || 0}</span>
            <span className="text-xs">Species</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{checklistCount?.toLocaleString() || "--"}</span>
            <span className="text-xs">Checklists</span>
          </div>
        </div>
        <div className="flex gap-2 mt-6 mb-2">
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
      </Body>
    </>
  );
}
