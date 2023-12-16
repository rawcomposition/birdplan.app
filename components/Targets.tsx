import React from "react";
import { useTrip } from "providers/trip";
import { useModal } from "providers/modals";
import useProfiles from "hooks/useProfiles";
import { useProfile } from "providers/profile";
import { useUser } from "providers/user";
import { Menu, Transition } from "@headlessui/react";
import useTripTargetImages from "hooks/useTripTargetImages";
import AngleDown from "icons/AngleDown";
import clsx from "clsx";
import Map from "icons/map";
import Input from "components/Input";
import InputNotesSimple from "components/InputNotesSimple";
import CheckIcon from "icons/Check";

export default function Targets() {
  const [search, setSearch] = React.useState("");
  const [selectedUid, setSelectedUid] = React.useState("");
  const { targets, trip, invites, canEdit, setSelectedSpecies, setTargetNotes } = useTrip();
  const { profiles } = useProfiles(trip?.userIds);
  const { addToLifeList } = useProfile();
  const { user } = useUser();
  const { close, modalId } = useModal();
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

  const handleSeen = (code: string, name: string) => {
    if (!confirm(`Are you sure you want to add ${name} to your life list?`)) return;
    addToLifeList(code);
  };

  return (
    <div className="h-full overflow-auto" onClick={handleDivClick}>
      <div className="mt-8 max-w-2xl w-full mx-auto p-4 md:p-0">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-700">Trip Targets</h1>
        </div>
        {options.length > 1 && (
          <Menu as="div" className="mb-3 text-left relative">
            <div>
              <Menu.Button className="">
                <span className="text-gray-400 text-[12px]">Targets for</span>{" "}
                <span className="text-gray-600 text-[13px] hover:text-gray-600">
                  {selectedOption?.name} <AngleDown />
                </span>
              </Menu.Button>
            </div>

            <Transition
              as={React.Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute left-12 top-7 z-10 w-44 origin-top-left rounded-md bg-gray-800 shadow-lg ring-1 ring-gray-700 focus:outline-none">
                <div className="py-2">
                  {options?.map(({ name, uid }) => (
                    <Menu.Item key={uid}>
                      <button
                        onClick={() => setSelectedUid(uid || "")}
                        className="w-full px-4 py-1 text-left text-[13px] hover:text-gray-200 text-gray-300"
                      >
                        {name}
                      </button>
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        )}
        <Input
          type="search"
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
          placeholder="Search species"
          className="mb-4"
        />
        {filteredTargets?.map((it) => {
          const imgUrl = images?.find((image) => image.code === it.code)?.url;
          return (
            <article
              key={it.code}
              className="mb-4 border border-gray-200 bg-white shadow-sm rounded-md w-full flex flex-col"
            >
              <div className="flex items-start">
                <MerlinkLink code={it.code} className="flex-shrink-0">
                  <img
                    src={imgUrl || "/placeholder.png"}
                    alt={it.name}
                    className={clsx("w-16 h-16 rounded-lg object-cover m-4 mr-8", !imgUrl && "opacity-60")}
                    loading="lazy"
                  />
                </MerlinkLink>
                <div className="pr-2 pt-3 xs:pr-4 w-full py-4 flex justify-between items-start flex-grow gap-4">
                  <div className="flex flex-col gap-1 w-full mt-1">
                    <MerlinkLink code={it.code}>
                      <h3 className="font-bold text-gray-800">{it.name}</h3>
                    </MerlinkLink>
                    <div className="text-[13px] text-gray-600 flex items-center gap-2">
                      <InputNotesSimple
                        value={it.notes}
                        onBlur={(value) => setTargetNotes(it.code, value)}
                        className="mt-1 mb-4 w-full"
                        canEdit={canEdit}
                        showDone
                      />
                    </div>
                  </div>
                  <div className="whitespace-nowrap mt-1">
                    <span className="rounded-sm px-2 py-1 text-xs whitespace-nowrap bg-gray-300 text-gray-600">
                      {it.percent}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex border-t border-gray-200 text-sm">
                <button
                  type="button"
                  className="flex items-center gap-2 py-2 text-gray-600 hover:text-gray-800 font-semibold text-left px-4 border-r border-gray-200"
                  onClick={() => setSelectedSpecies({ code: it.code, name: it.name })}
                >
                  <Map className="text-red-500/80" />
                  View Map
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 py-2 text-gray-600 hover:text-gray-800 font-semibold text-left px-4 border-r border-gray-200"
                  onClick={() => handleSeen(it.code, it.name)}
                >
                  <CheckIcon className="text-green-500/80" />
                  Mark as seen
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

type MerlinLinkPropsT = {
  children: React.ReactNode;
  className?: string;
  code: string;
};

const MerlinkLink = ({ code, children, className }: MerlinLinkPropsT) => (
  <>
    <a href={`https://ebird.org/species/${code}`} target="_blank" className={clsx(className, "hidden md:inline")}>
      {children}
    </a>
    <a href={`merlinbirdid://species/${code}'`} target="_blank" className={clsx(className, "md:hidden")}>
      {children}
    </a>
  </>
);
