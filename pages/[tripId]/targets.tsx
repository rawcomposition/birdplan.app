import React from "react";
import Header from "components/Header";
import Head from "next/head";
import MapBox from "components/Mapbox";
import { useModal } from "providers/modals";
import useFetchSpeciesObs from "hooks/useFetchSpeciesObs";
import toast from "react-hot-toast";
import { useTrip } from "providers/trip";
import SpeciesCard from "components/SpeciesCard";
import TripNav from "components/TripNav";
import { useUser } from "providers/user";
import clsx from "clsx";
import Map from "icons/map";
import Input from "components/Input";
import InputNotesSimple from "components/InputNotesSimple";
import CheckIcon from "icons/Check";
import { Menu, Transition } from "@headlessui/react";
import ErrorBoundary from "components/ErrorBoundary";
import useProfiles from "hooks/useProfiles";
import { useProfile } from "providers/profile";
import useTripTargetImages from "hooks/useTripTargetImages";
import AngleDown from "icons/AngleDown";
import MerlinkLink from "components/MerlinLink";
import Button from "components/Button";
import Link from "next/link";

export default function TripTargets() {
  const { open } = useModal();
  const { user } = useUser();
  const [isAddingMarker, setIsAddingMarker] = React.useState(false);
  const { targets, trip, invites, canEdit, selectedSpecies, setSelectedSpecies, setTargetNotes } = useTrip();
  const { obs, obsLayer } = useFetchSpeciesObs({ region: trip?.region, code: selectedSpecies?.code });
  const [search, setSearch] = React.useState("");
  const [selectedUid, setSelectedUid] = React.useState("");
  const { profiles } = useProfiles(trip?.userIds);
  const { addToLifeList } = useProfile();
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

  const obsClick = (id: string) => {
    const observation = obs.find((it) => it.id === id);
    if (!observation) return toast.error("Observation not found");
    observation.isPersonal
      ? open(observation.isPersonal ? "personalLocation" : "hotspot", {
          hotspot: observation,
          speciesCode: selectedSpecies?.code,
          speciesName: selectedSpecies?.name,
        })
      : open("hotspot", { hotspot: observation, speciesName: selectedSpecies?.name });
  };

  const handleSeen = (code: string, name: string) => {
    if (!confirm(`Are you sure you want to add ${name} to your life list?`)) return;
    addToLifeList(code);
  };

  return (
    <div className="flex flex-col h-full">
      {trip && (
        <Head>
          <title>{`${trip.name} | BirdPlan.app`}</title>
        </Head>
      )}

      <Header title={trip?.name || ""} parent={{ title: "Trips", href: user?.uid ? "/trips" : "/" }} />
      <TripNav active="targets" />
      <main className="flex h-[calc(100%-60px-52px)]">
        <ErrorBoundary>
          <div className="h-full grow flex sm:relative flex-col w-full">
            {selectedSpecies ? (
              <>
                {selectedSpecies && <SpeciesCard name={selectedSpecies.name} code={selectedSpecies.code} />}
                <div className="w-full grow relative">
                  {trip?.bounds && (
                    <MapBox
                      key={trip.id}
                      onHotspotClick={obsClick}
                      obsLayer={selectedSpecies && obsLayer}
                      bounds={trip.bounds}
                      addingMarker={isAddingMarker}
                      onDisableAddingMarker={() => setIsAddingMarker(false)}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="h-full overflow-auto">
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
                  {!!targets?.N && !filteredTargets?.length && (
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                      <h3 className="text-lg font-medium mb-2 text-gray-700">No targets found</h3>
                      <p className="text-gray-500 text-sm">
                        It looks like you have already seen all the species in this region.
                      </p>
                    </div>
                  )}
                  {!targets?.N && !filteredTargets?.length && (
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                      <h3 className="text-lg font-medium mb-4 text-gray-700">
                        You haven&apos;t imported your targets yet
                      </h3>
                      <Button href={`/${trip?.id}/import-targets?redirect=targets`} color="primary" size="sm">
                        Import Targets
                      </Button>
                    </div>
                  )}
                  {!!filteredTargets?.length && (
                    <Input
                      type="search"
                      value={search}
                      onChange={(e: any) => setSearch(e.target.value)}
                      placeholder="Search species"
                      className="mb-4"
                    />
                  )}
                  {filteredTargets?.map((it, index) => {
                    const imgUrl = images?.find((image) => image.code === it.code)?.url;
                    return (
                      <article
                        key={it.code}
                        className="mb-4 border border-gray-200 bg-white shadow-sm rounded-md w-full flex flex-col relative"
                      >
                        <span className="absolute top-0 right-0 bg-gray-200 text-gray-600 text-[12px] px-2 py-1 rounded-bl-md">
                          {index + 1}
                        </span>
                        <div className="flex items-start">
                          <MerlinkLink code={it.code} className="flex-shrink-0">
                            <img
                              src={imgUrl || "/placeholder.png"}
                              alt={it.name}
                              className={clsx("w-16 h-16 rounded-lg object-cover m-4 mr-8", !imgUrl && "opacity-60")}
                              loading="lazy"
                            />
                          </MerlinkLink>
                          <div className="pr-2 pt-3 xs:pr-4 w-full py-4 flex items-start flex-grow gap-4">
                            <div className="flex flex-col gap-1 w-full mt-1">
                              <div className="flex items-center gap-3">
                                <MerlinkLink code={it.code}>
                                  <h3 className="font-bold text-gray-800">
                                    <span className="sm:hidden">{index + 1}.</span> {it.name}
                                  </h3>
                                </MerlinkLink>
                                <span
                                  className="text-gray-600 text-[13px]"
                                  title="Percentage of checklists in the region that include this species"
                                >
                                  {it.percent}%
                                </span>
                              </div>
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
                          {canEdit && (
                            <button
                              type="button"
                              className="flex items-center gap-2 py-2 text-gray-600 hover:text-gray-800 font-semibold text-left px-4 border-r border-gray-200"
                              onClick={() => handleSeen(it.code, it.name)}
                            >
                              <CheckIcon className="text-green-500/80" />
                              Mark as seen
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                  {!!targets?.N && (
                    <div className="my-4">
                      <Link
                        href={`/${trip?.id}/import-targets?redirect=targets`}
                        className="text-sky-600 font-bold text-sm"
                      >
                        Re-import targets
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
