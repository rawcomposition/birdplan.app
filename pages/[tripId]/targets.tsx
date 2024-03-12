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
import Input from "components/Input";
import InputNotesSimple from "components/InputNotesSimple";
import { Menu, Transition } from "@headlessui/react";
import ErrorBoundary from "components/ErrorBoundary";
import useProfiles from "hooks/useProfiles";
import { useProfile } from "providers/profile";
import Icon from "components/Icon";
import MerlinkLink from "components/MerlinLink";
import Button from "components/Button";
import Link from "next/link";
import useFetchRecentSpecies from "hooks/useFetchRecentSpecies";
import { dateTimeToRelative } from "lib/helpers";

export default function TripTargets() {
  const { open } = useModal();
  const { user } = useUser();
  const [expandedCodes, setExpandedCodes] = React.useState<string[]>([]);
  const [isAddingMarker, setIsAddingMarker] = React.useState(false);
  const { targets, trip, invites, canEdit, selectedSpecies, setSelectedSpecies, setTargetNotes } = useTrip();
  const { obs, obsLayer } = useFetchSpeciesObs({ region: trip?.region, code: selectedSpecies?.code });
  const [search, setSearch] = React.useState("");
  const [selectedUid, setSelectedUid] = React.useState("");
  const { profiles } = useProfiles(trip?.userIds);
  const { addToLifeList } = useProfile();
  const myUid = user?.uid || trip?.userIds?.[0];
  const actualUid = selectedUid || myUid;

  const { recentSpecies, isLoading: loadingRecent } = useFetchRecentSpecies(trip?.region);

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

  const onToggleExpand = (code: string) => {
    if (expandedCodes.includes(code)) {
      setExpandedCodes(expandedCodes.filter((it) => it !== code));
    } else {
      setExpandedCodes([...expandedCodes, code]);
    }
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
            <div className="h-full overflow-auto">
              <div className="mt-2 sm:mt-8 max-w-2xl w-full mx-auto p-4 md:p-0">
                <div className="mb-8 sm:mb-10">
                  <h1 className="text-3xl font-bold text-gray-700">Trip Targets</h1>
                </div>
                {options.length > 1 && (
                  <Menu as="div" className="mb-3 text-left relative">
                    <div>
                      <Menu.Button className="">
                        <span className="text-gray-400 text-[12px]">Targets for</span>{" "}
                        <span className="text-gray-600 text-[13px] hover:text-gray-600">
                          {selectedOption?.name} <Icon name="angleDown" />
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
                {!!targetSpecies?.length && (
                  <Input
                    type="search"
                    value={search}
                    onChange={(e: any) => setSearch(e.target.value)}
                    placeholder="Search species"
                    className="mb-4"
                  />
                )}
                {!!targets?.N && !filteredTargets?.length && (
                  <div className="bg-white rounded-lg shadow p-4 text-center">
                    <h3 className="text-lg font-medium mb-2 text-gray-700">No targets found</h3>
                    <p className="text-gray-500 text-sm">
                      {filteredTargets?.length === targetSpecies?.length
                        ? "It looks like you have already seen all the species in this region."
                        : "No targets found for your search."}
                    </p>
                  </div>
                )}
                {!targets?.N && !filteredTargets?.length && (
                  <div className="bg-white rounded-lg shadow p-4 text-center">
                    <h3 className="text-lg font-medium mb-4 text-gray-700">
                      You haven&apos;t imported your targets yet
                    </h3>
                    <Button href={`/${trip?.id}/import-targets?redirect=targets&back=true`} color="primary" size="sm">
                      Import Targets
                    </Button>
                  </div>
                )}
                {filteredTargets?.map((it, index) => {
                  const isExpanded = expandedCodes.includes(it.code);
                  const lastReport = recentSpecies?.find((species) => species.code === it.code);
                  return (
                    <article
                      key={it.code}
                      className="mb-4 border border-gray-200 bg-white shadow-sm rounded-md w-full flex flex-col relative"
                    >
                      <div className="flex items-center cursor-pointer" onClick={() => onToggleExpand(it.code)}>
                        <div className="flex-shrink-0 mb-auto">
                          <img
                            src={`/api/species-img/${it.code}`}
                            alt={it.name}
                            className="w-16 h-16 rounded-lg object-cover m-4 mr-8"
                            loading="lazy"
                          />
                        </div>
                        <div className="pr-2 pt-3 xs:pr-4 w-full py-4 flex items-start flex-grow gap-4">
                          <div className="flex flex-col gap-1 w-full mt-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-bold text-gray-800">
                                <span className="font-normal">{index + 1}.</span> {it.name}
                              </h3>
                              <span
                                className="text-gray-600 text-[13px]"
                                title="Percentage of checklists in the region that include this species"
                              >
                                {it.percent}%
                              </span>
                            </div>
                            <span className="text-[14px] text-gray-600" title="Last reported">
                              {lastReport?.date
                                ? dateTimeToRelative(lastReport.date, trip?.timezone, true)
                                : loadingRecent
                                ? "loading last report..."
                                : "> 30 days ago"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center pr-4 pl-1">
                          <button
                            type="button"
                            className={clsx("w-5 h-5 transition-all ease-in-out", isExpanded && "rotate-180")}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                              <path d="M239 401c9.4 9.4 24.6 9.4 33.9 0L465 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-175 175L81 175c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L239 401z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1">
                          <div className="text-sm text-gray-600 bg-gray-50 px-4 pt-3 pb-2 mb-5 rounded-sm">
                            <InputNotesSimple
                              value={it.notes}
                              onBlur={(value) => setTargetNotes(it.code, value)}
                              className=" w-full"
                              canEdit={canEdit}
                              showDone
                            />
                          </div>
                          <div className="flex text-sm gap-2">
                            <Button
                              color="pillOutlineGray"
                              type="button"
                              className="flex items-center gap-2 py-2 text-gray-600 hover:text-gray-800 font-semibold text-left px-4"
                              onClick={() => setSelectedSpecies({ code: it.code, name: it.name })}
                            >
                              <Icon name="map" className="text-red-500/80" />
                              <span className="hidden md:inline">View Map</span>
                              <span className="md:hidden">Map</span>
                            </Button>
                            <MerlinkLink
                              code={it.code}
                              className="items-center justify-center gap-0.5 whitespace-nowrap font-semibold text-md py-2 px-5 bg-transparent text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors rounded-full"
                            >
                              <span className="hidden md:inline">View on </span>
                              <img src="/ebird.png" alt="eBird" width={40} />
                            </MerlinkLink>
                            {canEdit && (
                              <Button
                                color="pillOutlineGray"
                                type="button"
                                className="flex items-center gap-2 py-2 text-gray-600 hover:text-gray-800 font-semibold text-left px-4"
                                onClick={() => handleSeen(it.code, it.name)}
                              >
                                <Icon name="check" className="text-green-500/80" />
                                <span className="hidden md:inline">Mark as seen</span>
                                <span className="md:hidden">Seen</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
                {!!targets?.N && (
                  <div className="my-4">
                    <Link
                      href={`/${trip?.id}/import-targets?redirect=targets&back=true`}
                      className="text-sky-600 font-bold text-sm"
                    >
                      Re-import targets
                    </Link>
                  </div>
                )}
              </div>
            </div>
            {selectedSpecies && (
              <div className="absolute inset-0 z-10">
                {selectedSpecies && <SpeciesCard name={selectedSpecies.name} code={selectedSpecies.code} />}
                <div className="w-full h-full relative">
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
              </div>
            )}
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
