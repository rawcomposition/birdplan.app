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
import ErrorBoundary from "components/ErrorBoundary";
import { useProfile } from "providers/profile";
import useProfiles from "hooks/useProfiles";
import Button from "components/Button";
import ProfileSelect from "components/ProfileSelect";
import NotFound from "components/NotFound";
import TargetRow from "components/TargetRow";

const PAGE_SIZE = 50;

export default function TripTargets() {
  const { open } = useModal();
  const { user } = useUser();
  const myUid = user?.uid;
  const { is404, targets, trip, selectedSpecies, canEdit } = useTrip();
  const { obs, obsLayer } = useFetchSpeciesObs({ region: trip?.region, code: selectedSpecies?.code });

  // Filter options
  const [search, setSearch] = React.useState("");
  const [showStarred, setShowStarred] = React.useState(false);
  const [uid, setUid] = React.useState<string | undefined>(user?.uid); // TODO
  const [page, setPage] = React.useState(1);
  const showCount = page * PAGE_SIZE;

  // Exclude non-lifers
  const { lifelist: myLifelist } = useProfile();
  const { profiles } = useProfiles();
  const lifelist = uid === myUid ? myLifelist : profiles?.find((it) => it.id === uid)?.lifelist || [];
  const targetSpecies = targets?.items?.filter((it) => !lifelist.includes(it.code)) || [];

  // Filter targets
  const filteredTargets = targetSpecies?.filter(
    (it) =>
      it.name.toLowerCase().includes(search.toLowerCase()) &&
      (showStarred ? trip?.targetStars?.includes(it.code) : true)
  );

  const truncatedTargets = filteredTargets?.slice(0, showCount);

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

  React.useEffect(() => {
    setUid(myUid);
  }, [myUid]);

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
              <ProfileSelect value={uid} onChange={setUid} />
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
              {!!targets?.N && !truncatedTargets?.length && (
                <div className="sm:bg-white sm:rounded-lg sm:shadow p-4 text-center mt-4">
                  <h3 className="text-lg font-medium mb-2 text-gray-700">No targets found</h3>
                  <p className="text-gray-500 text-sm">
                    {truncatedTargets?.length === truncatedTargets?.length
                      ? "It looks like you have already seen all the species in this region."
                      : "No targets found for your search."}
                  </p>
                </div>
              )}
              {!targets?.N && !truncatedTargets?.length && (
                <div className="sm:bg-white sm:rounded-lg sm:shadow p-4 text-center mt-4 space-y-2">
                  {canEdit ? (
                    <h3 className="text-lg font-medium text-gray-700">You haven&apos;t imported your targets yet</h3>
                  ) : (
                    <h3 className="text-lg font-medium text-gray-700">No targets have been imported yet</h3>
                  )}
                  {canEdit && (
                    <p>
                      <Button href={`/${trip?.id}/import-targets?redirect=targets&back=true`} color="primary" size="sm">
                        Import Targets
                      </Button>
                    </p>
                  )}
                </div>
              )}
              {!!truncatedTargets?.length && (
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
                    {truncatedTargets?.map((it, index) => (
                      <TargetRow key={it.code} {...it} index={index} />
                    ))}
                  </tbody>
                </table>
              )}

              <div className="my-4 text-center pb-4">
                {filteredTargets?.length > showCount && (
                  <button type="button" className="text-sky-600 font-bold text-sm" onClick={() => setPage(page + 1)}>
                    Show {Math.min(filteredTargets.length - showCount, 50)} more
                  </button>
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
