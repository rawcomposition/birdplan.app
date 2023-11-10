import React from "react";
import Sidebar from "components/Sidebar";
import Header from "components/Header";
import Head from "next/head";
import MapBox from "components/Mapbox";
import { useModal } from "providers/modals";
import useFetchRecentSpecies from "hooks/useFetchRecentSpecies";
import useFetchSpeciesObs from "hooks/useFetchSpeciesObs";
import { getMarkerColorIndex } from "lib/helpers";
import toast from "react-hot-toast";
import { useTrip } from "providers/trip";
import SpeciesCard from "components/SpeciesCard";
import Button from "components/Button";
import { useUI } from "providers/ui";
import TargetSpeciesSidebarBlock from "components/TargetSpeciesSidebarBlock";
import RecentSpeciesSidebarBlock from "components/RecentSpeciesSidebarBlock";
import MapFlatIcon from "icons/MapFlat";
import ListIcon from "icons/List";
import TripNav from "components/TripNav";
import { useUser } from "providers/user";

export default function Targets() {
  const { open } = useModal();
  const { targets, trip, canEdit, selectedSpeciesCode } = useTrip();
  const { closeSidebar, openSidebar, sidebarOpen } = useUI();
  const { user } = useUser();

  const { recentSpecies } = useFetchRecentSpecies(trip?.region);
  const selectedSpecies = [...recentSpecies, ...targets.items].find((it) => it.code === selectedSpeciesCode);
  const { obs, obsLayer } = useFetchSpeciesObs({ region: trip?.region, code: selectedSpeciesCode });

  const obsClick = (id: string) => {
    const observation = obs.find((it) => it.id === id);
    if (!observation) return toast.error("Observation not found");
    observation.isPersonal
      ? open(observation.isPersonal ? "personalLocation" : "hotspot", {
          hotspot: observation,
          speciesCode: selectedSpeciesCode,
          speciesName: selectedSpecies?.name,
        })
      : open("hotspot", { hotspot: observation, speciesName: selectedSpecies?.name });
  };

  return (
    <div className="flex flex-col h-full">
      {trip && (
        <Head>
          <title>{`${trip.name} | BirdPlan.app`}</title>
        </Head>
      )}

      <Header title={trip?.name || ""} parent={{ title: "Trips", href: user?.uid ? "/trips" : "/" }} />
      <main className="flex h-[calc(100%-60px)]">
        <Sidebar noPadding fullWidth noAnimation noAccount>
          <TripNav tripId={trip?.id || ""} active="targets" />
          <div>
            <TargetSpeciesSidebarBlock />
            {canEdit && <RecentSpeciesSidebarBlock recentSpecies={recentSpecies} />}
          </div>
          {sidebarOpen && (
            <Button
              color="pillWhite"
              className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2"
              onClick={closeSidebar}
            >
              Map <MapFlatIcon className="w-4 h-4" />
            </Button>
          )}
        </Sidebar>

        <div className="h-full grow flex sm:relative flex-col" onClick={closeSidebar}>
          {selectedSpecies && <SpeciesCard name={selectedSpecies.name} code={selectedSpecies.code} />}
          <div className="w-full grow relative">
            {trip?.bounds && (
              <MapBox
                key={trip.id}
                onHotspotClick={obsClick}
                obsLayer={selectedSpeciesCode && obsLayer}
                bounds={trip.bounds}
              />
            )}
          </div>
        </div>
        <Button
          color="pillWhite"
          className="sm:hidden absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2"
          onClick={openSidebar}
        >
          List <ListIcon className="w-4 h-4" />
        </Button>
      </main>
    </div>
  );
}
