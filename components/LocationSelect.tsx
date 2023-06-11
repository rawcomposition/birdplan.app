import * as React from "react";
import { LocationValue } from "lib/types";
import Input from "components/Input";

type Props = {
  className?: string;
  value: LocationValue | null;
  justUSA?: boolean;
  onChange: (value: LocationValue) => void;
};

export default function LocationSearch({ className, justUSA, value, onChange, ...props }: Props) {
  const { label } = value || {};
  const inputRef = React.useRef(null);
  const isInitalizedRef = React.useRef<boolean>();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  };

  React.useEffect(() => {
    //@ts-ignore
    if (isInitalizedRef.current || !window.google) {
      return;
    }
    const handlePlaceSelect = (googlePlaces: any) => {
      const place = googlePlaces.getPlace();
      onChange({
        label: place.formatted_address,
        lat: parseFloat(place.geometry.location.lat().toFixed(7)),
        lng: parseFloat(place.geometry.location.lng().toFixed(7)),
      });
    };

    const options = {
      componentRestrictions: justUSA ? { country: "us" } : undefined,
      fields: ["formatted_address", "geometry"],
    };

    //@ts-ignore
    const googlePlaces = new window.google.maps.places.Autocomplete(inputRef.current, options);
    googlePlaces.setFields(["formatted_address", "geometry"]);
    googlePlaces.addListener("place_changed", () => {
      handlePlaceSelect(googlePlaces);
    });
    isInitalizedRef.current = true;
  });

  React.useEffect(() => {
    if (!label && inputRef.current) {
      (inputRef.current as HTMLInputElement).value = "";
    }
  }, [label]);

  return (
    <>
      <Input
        type="search"
        ref={inputRef}
        onKeyDown={handleKeyDown}
        defaultValue={label}
        placeholder="Location"
        className={className || ""}
        {...props}
      />
    </>
  );
}
