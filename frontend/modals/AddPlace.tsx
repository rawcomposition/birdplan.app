import React from "react";
import { Header, Body } from "providers/modals";
import Button from "components/Button";
import Field from "components/Field";
import { useModal } from "providers/modals";
import { useTrip } from "providers/trip";
import { nanoId } from "lib/helpers";
import { CustomMarker, GooglePlaceT } from "lib/types";
import MarkerWithIcon from "components/MarkerWithIcon";
import clsx from "clsx";
import toast from "react-hot-toast";
import PlaceSearch from "components/PlaceSearch";
import Icon from "components/Icon";
import { getGooglePlaceUrl } from "lib/helpers";
import { MarkerIconT, markerIcons } from "lib/icons";
import useTripMutation from "hooks/useTripMutation";

export default function AddPlace() {
  const [icon, setIcon] = React.useState<MarkerIconT>();
  const [place, setPlace] = React.useState<GooglePlaceT>();
  const { close } = useModal();
  const { trip } = useTrip();
  const firstRegion = trip?.region?.split(",")?.[0];
  const countryCode = firstRegion?.split("-")?.[0];

  const addMarkerMutation = useTripMutation<CustomMarker>({
    url: `/trips/${trip?._id}/markers`,
    method: "POST",
    updateCache: (old, input) => ({
      ...old,
      markers: [...(old.markers || []), input],
    }),
  });

  const handleAddMarker = () => {
    if (!icon) return toast.error("Please choose an icon");
    if (!place) return toast.error("Please choose a place");
    addMarkerMutation.mutate({
      lat: place.lat,
      lng: place.lng,
      name: place.name,
      icon,
      id: place.id || nanoId(6),
      placeId: place.id,
      placeType: place.type,
    });
    close();
  };

  const googleUrl = place && getGooglePlaceUrl(place.lat, place.lng, place.id);

  return (
    <>
      <Header>Add Place</Header>
      <Body>
        <div className="flex gap-2 mb-2">
          <div className="flex flex-col gap-5 w-full">
            {!place && (
              <Field label="Find a place">
                <PlaceSearch onChange={setPlace} country={countryCode || ""} focus />
                <p className="text-xs text-gray-500 mt-1">
                  Search for an airport, restaurant, hotel, or any other place.
                </p>
              </Field>
            )}
            {place && (
              <>
                <div className="flex gap-4 items-center justify-between text-left py-2 px-3 border bg-blue-100/40 rounded-md border-blue-100">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{place.name}</span>
                    <span className="text-xs text-gray-500">
                      <a href={googleUrl} target="_blank" rel="noreferrer">
                        View on Google Maps
                      </a>
                    </span>
                  </div>
                  <button
                    className="flex flex-col text-gray-600 items-center text-sm"
                    onClick={() => setPlace(undefined)}
                  >
                    <Icon name="xMark" />
                    <span className="uppercase text-[9px]">Cancel</span>
                  </button>
                </div>
                <div>
                  <label>Choose icon</label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {Object.keys(markerIcons).map((it) => (
                      <button
                        type="button"
                        key={it}
                        onClick={() => setIcon(it)}
                        className={clsx(
                          "border-2 p-1",
                          icon === it ? "border-blue-500 rounded-md" : "border-transparent"
                        )}
                      >
                        <MarkerWithIcon icon={it} className="scale-125" />
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="button" color="primary" className="mt-2" size="md" onClick={handleAddMarker}>
                  Add Place
                </Button>
              </>
            )}
          </div>
        </div>
      </Body>
    </>
  );
}
