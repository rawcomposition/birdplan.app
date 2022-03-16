import * as React from "react";
import Input from "./input";

export default function LocationSelect({value, onChange, ...props}) {
	const { label, lat, lng } = value;
	const inputRef = React.useRef(null);

	const handleKeyDown = (e) => {
		if (e.keyCode === 13) { 
			e.preventDefault();
		}
	}

	React.useEffect(() => {
		const handlePlaceSelect = (googlePlaces) => {
			const place = googlePlaces.getPlace();
			onChange({
				label: place.formatted_address,
				lat: place.geometry.location.lat(),
				lng: place.geometry.location.lng()
			});
		}

		const options = {
			componentRestrictions: { country: "us" },
			fields: ["formatted_address", "geometry"],
		};

		const googlePlaces = new window.google.maps.places.Autocomplete(inputRef.current, options);
		googlePlaces.setFields(["formatted_address", "geometry"]);
		googlePlaces.addListener("place_changed", () => {
			handlePlaceSelect(googlePlaces);
		});
	}, [onChange]);

	return (
		<Input ref={inputRef} onKeyDown={handleKeyDown} defaultValue={label} placeholder="Enter a location" {...props}/>
	)
}