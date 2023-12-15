import React from "react";
import { useTrip } from "providers/trip";
import { useModal } from "providers/modals";
import useProfiles from "hooks/useProfiles";
import { useUser } from "providers/user";
import useTripTargetImages from "hooks/useTripTargetImages";
import clsx from "clsx";

export default function Targets() {
  const [search, setSearch] = React.useState("");
  const [selectedUid, setSelectedUid] = React.useState("");
  const { targets, trip, invites } = useTrip();
  const { profiles } = useProfiles(trip?.userIds);
  const { user } = useUser();
  const { open, close, modalId } = useModal();
  const images = useTripTargetImages();
  const myUid = user?.uid || trip?.userIds?.[0];
  const actualUid = selectedUid || myUid;

  const lifelist = profiles.find((it) => it.id === actualUid)?.lifelist || [];
  const targetSpecies = targets?.items?.filter((it) => !lifelist.includes(it.code)) || [];
  const filteredTargets = targetSpecies.filter((it) => it.name.toLowerCase().includes(search.toLowerCase()));

  const inviteOptions = invites
    ?.filter(({ uid }) => !!uid)
    .map(({ name, email, uid }) => ({
      name: name || email,
      uid,
    }));

  const options = [
    {
      name: `${user?.displayName} (me)`,
      uid: myUid,
    },
    ...inviteOptions,
  ];

  const selectedOption = options.find((it) => it.uid === actualUid);

  const handleDivClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!modalId) return;
    const isButton = (e.target as HTMLElement).closest("button");
    if (isButton) return;
    modalId && close();
  };

  return (
    <div className="h-full overflow-auto" onClick={handleDivClick}>
      <div className="mt-8 max-w-2xl w-full mx-auto p-4 md:p-0">
        <div className="mb-12">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-700">Trip Targets</h1>
          </div>
        </div>
        {filteredTargets?.map((it) => {
          const imgUrl = images?.find((image) => image.code === it.code)?.url;
          return (
            <article key={it.code} className="mb-4 border border-gray-200 bg-white shadow-sm rounded-md w-full flex">
              <div className="flex-shrink-0 p-4 mr-4">
                <img
                  src={imgUrl || "/placeholder.png"}
                  alt={it.name}
                  className={clsx("w-16 h-16 rounded-lg object-cover", !imgUrl && "opacity-60")}
                  loading="lazy"
                />
              </div>
              <div className="pr-2 pt-3 xs:pr-4 w-full py-4 xs:flex xs:justify-between items-center">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-gray-800">{it.name}</h3>
                  <div className="text-[13px] text-gray-600 flex items-center gap-2">
                    <span>Hola</span>
                  </div>
                </div>
                <div className="whitespace-nowrap flex gap-2 items-center mt-2 xs:mt-0">
                  <span className="rounded-sm px-2 py-1 text-xs whitespace-nowrap bg-gray-300 text-gray-600">
                    {it.percent}%
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
