import React from "react";
import Sidebar from "components/Sidebar";
import Header from "components/Header";
import Head from "next/head";
import { useProfile } from "providers/profile";
import MapBox from "components/Mapbox";
import { useModal } from "providers/modals";
import Expand from "components/Expand";
import useFetchHotspots from "hooks/useFetchHotspots";
import { getMarkerColorIndex } from "lib/helpers";
import HotspotList from "components/HotspotList";
import CustomMarkerRow from "components/CustomMarkerRow";
import clsx from "clsx";
import toast from "react-hot-toast";
import { useTrip } from "providers/trip";
import Button from "components/Button";
import ExternalIcon from "icons/External";
import ShareIcon from "icons/Share";
import Link from "next/link";
import { useUI } from "providers/ui";
import CloseButton from "components/CloseButton";
import Feather from "icons/Feather";
import Bullseye from "icons/Bullseye";
import MapFlatIcon from "icons/MapFlat";
import ListIcon from "icons/List";
import TripNav from "components/TripNav";
import Pencil from "icons/Pencil";
import Trash from "icons/Trash";
import { deleteTrip } from "lib/firebase";
import { useRouter } from "next/router";
import { useUser } from "providers/user";

export default function Trip() {
  const { open } = useModal();
  const router = useRouter();
  const [showAll, setShowAll] = React.useState(false);
  const { lifelist } = useProfile();
  const { targets, trip, isOwner, canEdit } = useTrip();
  const { closeSidebar, openSidebar, sidebarOpen } = useUI();
  const { user } = useUser();
  const [isAddingMarker, setIsAddingMarker] = React.useState(false);
  const isMultiRegion = trip?.region.includes(",");

  const savedHotspots = trip?.hotspots || [];
  const { hotspots, hotspotLayer } = useFetchHotspots(showAll);

  const savedHotspotMarkers = savedHotspots.map((it) => ({
    lat: it.lat,
    lng: it.lng,
    shade: getMarkerColorIndex(it.species || 0),
    id: it.id,
  }));

  const markers = [...savedHotspotMarkers];
  const customMarkers = trip?.markers || [];

  const hotspotClick = (id: string) => {
    const allHotspots = hotspots.length > 0 ? hotspots : savedHotspots;
    const hotspot = allHotspots.find((it) => it.id === id);
    if (!hotspot) return toast.error("Hotspot not found");
    open("hotspot", { hotspot });
  };

  const handleEnableAddingMarker = () => {
    setIsAddingMarker(true);
    closeSidebar();
  };

  const handleDelete = async () => {
    if (!trip) return;
    if (confirm("Are you sure you want to delete this trip?")) {
      await deleteTrip(trip.id);
      router.push("/trips");
    }
  };

  const tripIsLoaded = !!trip;
  const tripIsNew = trip?.hotspots.length === 0;

  React.useEffect(() => {
    if (tripIsLoaded && tripIsNew) {
      setShowAll(true);
    }
  }, [tripIsLoaded, tripIsNew]);

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
          <TripNav tripId={trip?.id || ""} active="" />
          <div className="mb-4 px-6 pt-4 border-t border-gray-700">
            <label className="text-white text-sm flex items-center gap-1">
              <input type="checkbox" className="mr-2" checked={showAll} onChange={() => setShowAll((prev) => !prev)} />
              Show all hotspots
            </label>
          </div>
          <div>
            <Expand heading="Trip Hotspots" count={savedHotspots.length}>
              <HotspotList />
            </Expand>

            <Expand heading="Custom Markers" count={trip?.markers?.length}>
              <ul className="space-y-2 mb-4 text-gray-200">
                {trip?.markers?.map((marker) => (
                  <CustomMarkerRow key={marker.id} {...marker} />
                ))}
              </ul>
              {canEdit && (
                <>
                  {isAddingMarker ? (
                    <Button size="xs" color="gray" onClick={() => setIsAddingMarker(false)}>
                      Cancel Adding Marker
                    </Button>
                  ) : (
                    <Button size="xs" color="primary" onClick={handleEnableAddingMarker}>
                      + Add Marker
                    </Button>
                  )}
                </>
              )}
            </Expand>
            {canEdit && (
              <Expand heading="Settings">
                <div className="text-sm text-gray-400 flex flex-col gap-3">
                  <Link href={`/import-lifelist?tripId=${trip?.id}`} className="flex items-center gap-2 text-gray-300">
                    <Feather aria-hidden="true" />
                    {!!lifelist?.length
                      ? `Update Life List (${lifelist?.length?.toLocaleString()})`
                      : "Import Life List"}
                  </Link>
                  <Link href={`/${trip?.id}/import-targets`} className="flex items-center gap-2 text-gray-300">
                    <Bullseye aria-hidden="true" />
                    {!!targets?.items?.length ? "Update Targets" : "Import Targets"}
                  </Link>
                  <button
                    onClick={() => open("renameTrip", { trip })}
                    className="flex items-center gap-2 text-gray-300"
                  >
                    <Pencil aria-hidden="true" />
                    Rename Trip
                  </button>
                  {isOwner && (
                    <button
                      type="button"
                      className="text-gray-300 flex items-center gap-2"
                      onClick={() => open("share")}
                    >
                      <ShareIcon />
                      Share Trip
                    </button>
                  )}
                  <button onClick={handleDelete} className="flex items-center gap-2 text-red-500">
                    <Trash aria-hidden="true" />
                    Delete Trip
                  </button>
                </div>
              </Expand>
            )}
          </div>
          {trip && !isMultiRegion ? (
            <div
              className={clsx("mb-8 ml-4 text-sm text-gray-400 flex flex-col gap-2", isOwner ? "mt-2 lg:mt-4" : "mt-4")}
            >
              <Link
                href={`https://ebird.org/targets?region=&r1=${trip.region}&bmo=${trip.startMonth}&emo=${trip.endMonth}&r2=world&t2=life&mediaType=`}
                className="text-gray-400 inline-flex items-center gap-1"
                target="_blank"
              >
                <ExternalIcon className="text-xs" /> eBird Targets
              </Link>
              <Link
                href={`https://ebird.org/region/${trip.region}/media?yr=all&m=`}
                className="text-gray-400 inline-flex items-center gap-2"
                target="_blank"
              >
                <ExternalIcon className="text-xs" /> Illustrated Checklist
              </Link>
            </div>
          ) : (
            <div className="mb-12" />
          )}
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
          <div className="w-full grow relative">
            {trip?.bounds && (
              <MapBox
                key={trip.id}
                onHotspotClick={hotspotClick}
                markers={markers}
                customMarkers={customMarkers}
                hotspotLayer={showAll && hotspotLayer}
                bounds={trip.bounds}
                addingMarker={isAddingMarker}
                onDisableAddingMarker={() => setIsAddingMarker(false)}
              />
            )}
            {isAddingMarker && (
              <div className="flex absolute top-0 left-1/2 bg-white text-gray-600 text-sm px-4 py-2 -translate-x-1/2 rounded-b-lg w-full max-w-xs z-10 text-center">
                Click anywhere on map to add marker
                <CloseButton onClick={() => setIsAddingMarker(false)} className="ml-auto" />
              </div>
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
