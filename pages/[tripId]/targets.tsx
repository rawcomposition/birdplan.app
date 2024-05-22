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
import NotFound from "components/NotFound";

export default function TripTargets() {
  const { open } = useModal();
  const { user } = useUser();
  const [expandedCodes, setExpandedCodes] = React.useState<string[]>([]);
  const [isAddingMarker, setIsAddingMarker] = React.useState(false);
  const { is404, targets, trip, invites, canEdit, selectedSpecies, setSelectedSpecies, setTargetNotes } = useTrip();
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

  if (is404) return <NotFound />;

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
            <div className="h-full w-full mx-auto max-w-6xl">
              {options.length > 1 && (
                <Menu as="div" className="mt-1 text-left relative">
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
              <div className="flex items-center gap-4 mt-3">
                {!!targetSpecies?.length && (
                  <Input
                    type="search"
                    value={search}
                    onChange={(e: any) => setSearch(e.target.value)}
                    placeholder="Search species"
                    className="mb-4 max-w-xs"
                  />
                )}
              </div>
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
                  <h3 className="text-lg font-medium mb-4 text-gray-700">You haven&apos;t imported your targets yet</h3>
                  <Button href={`/${trip?.id}/import-targets?redirect=targets&back=true`} color="primary" size="sm">
                    Import Targets
                  </Button>
                </div>
              )}
              <table className="divide-y w-full">
                <thead className="hidden sm:table-header-group">
                  <tr>
                    <th className="text-left text-gray-500 font-normal uppercase text-xs pb-1 px-4 w-0">#</th>
                    <th className="text-left text-gray-500 font-normal uppercase text-xs pb-1 w-[4.3rem] lg:w-20">
                      Image
                    </th>
                    <th className="text-left text-gray-500 font-normal uppercase text-xs pb-1">Species</th>
                    <th className="text-left text-gray-500 font-normal uppercase text-xs pb-1 w-0 hidden md:table-cell">
                      Notes
                    </th>
                    <th className="text-left text-gray-500 font-normal uppercase text-xs pb-1 md:w-12 lg:w-20">%</th>
                    <th className="text-left text-gray-500 font-normal uppercase text-xs pb-1">Last seen</th>
                    <th className="w-0" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTargets?.map((it, index) => {
                    const isExpanded = expandedCodes.includes(it.code);
                    const lastReport = recentSpecies?.find((species) => species.code === it.code);
                    return (
                      <React.Fragment key={it.code}>
                        <tr className="w-full relative">
                          <td className="text-gray-500 px-4 hidden sm:table-cell">{index + 1}.</td>
                          <td>
                            <MerlinkLink code={it.code}>
                              <img
                                src={`/api/species-img/${it.code}`}
                                alt={it.name}
                                className="w-14 h-14 min-w-[3.5rem] rounded-lg object-cover my-1 mx-1 sm:mx-0"
                                loading="lazy"
                              />
                            </MerlinkLink>
                          </td>
                          <td>
                            <div className="flex flex-col gap-1 w-full mt-1">
                              <h3 className="text-sm lg:text-base font-bold pl-2 sm:pl-0">
                                <MerlinkLink code={it.code} className="text-gray-800">
                                  {it.name}
                                </MerlinkLink>
                              </h3>
                            </div>
                          </td>
                          <td className="hidden md:table-cell">
                            <textarea
                              className="input w-[150px] md:w-[200px] lg:w-[300px] border bg-transparent shadow-none opacity-75 hover:opacity-100 focus-within:opacity-100 border-transparent hover:border-gray-200 focus-within:border-gray-200 my-1 h-14 block text-[13px] p-1.5 md:mr-2 lg:mr-8"
                              placeholder="Add notes..."
                            />
                          </td>
                          <td className="text-gray-600 font-bold pr-4">{it.percent}%</td>
                          <td className="text-[14px] text-gray-600 hidden sm:table-cell">
                            {lastReport?.date
                              ? dateTimeToRelative(lastReport.date, trip?.timezone, true)
                              : loadingRecent
                              ? "loading last seen..."
                              : "> 30 days ago"}
                          </td>
                          <td>
                            <div className="flex items-center gap-6 mr-6 ml-2 justify-end whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => null}
                                className="items-center justify-cente hidden sm:flex"
                              >
                                <Icon name="starOutline" className="text-gray-500 text-lg" />
                              </button>
                              <Button
                                color="pillOutlineGray"
                                type="button"
                                size="xsPill"
                                className="flex items-center gap-2"
                                onClick={() => setSelectedSpecies({ code: it.code, name: it.name })}
                              >
                                <Icon name="map" className="text-red-500/80" />
                                <span className="hidden md:inline">View Map</span>
                                <span className="md:hidden">Map</span>
                              </Button>
                              <button
                                type="button"
                                className={clsx("w-5 h-5 transition-all ease-in-out", isExpanded && "rotate-180")}
                                onClick={() => onToggleExpand(it.code)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                                  <path d="M239 401c9.4 9.4 24.6 9.4 33.9 0L465 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-175 175L81 175c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L239 401z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="!border-t-0">
                            <td colSpan={2} className="hidden sm:table-cell" />
                            <td colSpan={5} className="p-2 sm:hidden">
                              <textarea
                                className="input w-[150px] md:w-[200px] lg:w-[300px] border bg-transparent shadow-none opacity-75 hover:opacity-100 focus-within:opacity-100 border-transparent hover:border-gray-200 focus-within:border-gray-200 my-1 h-14 block text-[13px] p-1.5 md:mr-2 lg:mr-8"
                                placeholder="Add notes..."
                              />
                              {canEdit && (
                                <button
                                  type="button"
                                  className="w-full bg-gray-200 text-gray-700 font-medium text-[12px] py-1.5 px-2.5 rounded-md"
                                  onClick={() => handleSeen(it.code, it.name)}
                                >
                                  Mark as seen
                                </button>
                              )}
                            </td>
                            <td colSpan={7} className="pb-4 hidden sm:table-cell">
                              {canEdit && (
                                <button
                                  type="button"
                                  className="text-sky-600 font-bold text-sm"
                                  onClick={() => handleSeen(it.code, it.name)}
                                >
                                  Mark as seen
                                </button>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
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
