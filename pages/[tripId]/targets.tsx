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
import Input from "components/Input";
import { Menu, Transition } from "@headlessui/react";
import ErrorBoundary from "components/ErrorBoundary";
import useProfiles from "hooks/useProfiles";
import Icon from "components/Icon";
import Button from "components/Button";
import Link from "next/link";
import NotFound from "components/NotFound";
import TargetRow from "components/TargetRow";

export default function TripTargets() {
  const { open } = useModal();
  const { user } = useUser();
  const [isAddingMarker, setIsAddingMarker] = React.useState(false);
  const { is404, targets, trip, invites, selectedSpecies } = useTrip();
  const { obs, obsLayer } = useFetchSpeciesObs({ region: trip?.region, code: selectedSpecies?.code });
  const [search, setSearch] = React.useState("");
  const [showStarred, setShowStarred] = React.useState(false);
  const [selectedUid, setSelectedUid] = React.useState("");
  const { profiles } = useProfiles(trip?.userIds);
  const myUid = user?.uid || trip?.userIds?.[0];
  const actualUid = selectedUid || myUid;

  const lifelist = profiles.find((it) => it.id === actualUid)?.lifelist || [];
  const targetSpecies = targets?.items?.filter((it) => !lifelist.includes(it.code)) || [];
  const filteredTargets = targetSpecies.filter(
    (it) => it.name.toLowerCase().includes(search.toLowerCase()) && (showStarred ? it.isStarred : true)
  );

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
                <Menu as="div" className="mt-1 ml-2 sm:ml-0 text-left relative sm:-mb-1">
                  <div>
                    <Menu.Button className="py-1 sm:py-0 sm:pt-2 ">
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
                <div className="flex items-center gap-2 my-2 sm:my-4 px-2 sm:px-0">
                  <Input
                    type="search"
                    value={search}
                    onChange={(e: any) => setSearch(e.target.value)}
                    placeholder="Search species"
                    className="max-w-xs"
                  />
                  <label className="flex items-center gap-2 py-2 px-3 text-gray-600 text-sm">
                    <input
                      type="checkbox"
                      checked={showStarred}
                      onChange={() => setShowStarred(!showStarred)}
                      className="form-checkbox text-sky-600"
                    />
                    <span className="text-gray-600 text-sm">Starred</span>
                  </label>
                </div>
              )}
              {!!targets?.N && !filteredTargets?.length && (
                <div className="sm:bg-white sm:rounded-lg sm:shadow p-4 text-center mt-4">
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
              {!!filteredTargets?.length && (
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
                    {filteredTargets?.map((it, index) => (
                      <TargetRow key={it.code} {...it} index={index} />
                    ))}
                  </tbody>
                </table>
              )}
              {!!targets?.N && (
                <div className="my-4 text-center sm:text-left">
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
