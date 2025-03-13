import React from "react";
import { GooglePlaceT } from "lib/types";
import Input from "components/Input";

type Props = {
  className?: string;
  country: string;
  focus?: boolean;
  onChange: (value: GooglePlaceT) => void;
};

export default function PlaceSearch({ className, country, onChange, focus, ...props }: Props) {
  const inputRef = React.useRef(null);
  const isInitalizedRef = React.useRef<boolean>(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.preventDefault();
  };

  React.useEffect(() => {
    //@ts-ignore
    if (isInitalizedRef.current || !window.google) {
      return;
    }
    const handlePlaceSelect = (googlePlaces: any) => {
      const place = googlePlaces.getPlace();
      onChange({
        name: place.name,
        lat: parseFloat(place.geometry.location.lat().toFixed(7)),
        lng: parseFloat(place.geometry.location.lng().toFixed(7)),
        id: place.place_id,
        type: place.types?.[0],
      });
    };

    const options = {
      componentRestrictions: { country: country.toLowerCase() },
      fields: ["place_id", "name", "geometry", "types"],
    };
    //@ts-ignore
    const googlePlaces = new window.google.maps.places.Autocomplete(inputRef.current, options);
    googlePlaces.setFields(["place_id", "name", "geometry", "types"]);
    googlePlaces.addListener("place_changed", () => {
      handlePlaceSelect(googlePlaces);
    });
    isInitalizedRef.current = true;
  });

  React.useEffect(() => {
    if (focus && inputRef.current) {
      (inputRef.current as HTMLInputElement).focus();
    }
  }, [focus]);

  if (!country) return null;

  return (
    <Input
      type="search"
      ref={inputRef}
      onKeyDown={handleKeyDown}
      placeholder="Search..."
      className={className || ""}
      {...props}
    />
  );
}
