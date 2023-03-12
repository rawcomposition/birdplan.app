import * as React from "react";
import Input from "components/Input";

declare global {
  interface Window {
    google: any;
  }
}

type Value = {
  label: string;
  lat: number;
  lng: number;
};

type Props = {
  value?: Value;
  onChange: (value: Value) => void;
  [key: string]: any;
};

export default function LocationSelect({ value, onChange, ...props }: Props) {
  const label = value?.label || "";
  const inputRef = React.useRef<HTMLInputElement>();
  const isInitalizedRef = React.useRef<boolean>(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  React.useEffect(() => {
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
      componentRestrictions: { country: "us" },
      fields: ["formatted_address", "geometry"],
    };

    const googlePlaces = new window.google.maps.places.Autocomplete(inputRef.current, options);
    googlePlaces.setFields(["formatted_address", "geometry"]);
    googlePlaces.addListener("place_changed", () => {
      handlePlaceSelect(googlePlaces);
    });
    isInitalizedRef.current = true;
  });

  React.useEffect(() => {
    if (!label && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [label]);

  return (
    <Input ref={inputRef} onKeyDown={handleKeyDown} defaultValue={label} placeholder="Enter a location" {...props} />
  );
}
