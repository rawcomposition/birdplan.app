import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "components/ui/input";
import { Spinner } from "components/ui/spinner";
import { PlaceSearchResult } from "lib/types";
import useDebouncedValue from "hooks/useDebouncedValue";
import { cn } from "lib/utils";

const PHOTON_TAGS = ["aeroway", "tourism", "leisure", "natural", "amenity", "railway", "highway:bus_stop"];
const PHOTON_API_URL = `https://photon.komoot.io/api/?${PHOTON_TAGS.map((tag) => `osm_tag=${tag}`).join("&")}`;

type PhotonFeature = {
  properties: {
    osm_id: number;
    osm_type: string;
    osm_value?: string;
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  geometry: { coordinates: [number, number] };
};

type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

type Props = {
  className?: string;
  bounds?: Bounds;
  focus?: boolean;
  onChange: (value: PlaceSearchResult) => void;
};

const formatContext = ({ street, city, state, country }: PhotonFeature["properties"]) =>
  [street, city, state, country].filter(Boolean).join(", ");

const boundsToParams = ({ minX, minY, maxX, maxY }: Bounds) => {
  const padX = Math.max((maxX - minX) * 0.4, 0.1);
  const padY = Math.max((maxY - minY) * 0.4, 0.1);
  return {
    bbox: `${minX - padX},${minY - padY},${maxX + padX},${maxY + padY}`,
    lat: (minY + maxY) / 2,
    lon: (minX + maxX) / 2,
  };
};

export default function PlaceSearch({ className, bounds, onChange, focus }: Props) {
  const [search, setSearch] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const query = useDebouncedValue(search.trim());

  const { data, isFetching } = useQuery<{ features: PhotonFeature[] }>({
    queryKey: [PHOTON_API_URL, { q: query, limit: 10, lang: "en", ...(bounds ? boundsToParams(bounds) : {}) }],
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  const seen = new Set<string>();
  const results = (data?.features || []).filter((feature) => {
    const { name, street, city, state } = feature.properties;
    const key = [name, street, city, state].join("|");
    if (!name || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const selectPlace = (feature: PhotonFeature) => {
    const [lng, lat] = feature.geometry.coordinates;
    onChange({
      name: feature.properties.name || search,
      lat: parseFloat(lat.toFixed(7)),
      lng: parseFloat(lng.toFixed(7)),
      type: feature.properties.osm_value,
      osmType: feature.properties.osm_type,
      osmId: feature.properties.osm_id,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) selectPlace(results[activeIndex]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  return (
    <div className="relative">
      <Input
        size="sm"
        type="search"
        autoFocus={focus}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setActiveIndex(0);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search for a place..."
        className={className}
      />
      {isFetching && <Spinner className="absolute right-3 top-2.5 text-muted-foreground" />}
      {query.length >= 2 && !!results.length && (
        <ul className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-md border bg-card shadow-md">
          {results.map((feature, index) => (
            <li key={`${feature.properties.osm_type}${feature.properties.osm_id}`}>
              <button
                type="button"
                onClick={() => selectPlace(feature)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn("w-full px-3 py-2 text-left", index === activeIndex && "bg-muted")}
              >
                <span className="block text-sm font-medium">{feature.properties.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {formatContext(feature.properties)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.length >= 2 && !isFetching && !!data && !results.length && (
        <p className="absolute top-full z-50 mt-1 w-full rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground shadow-md">
          No places found
        </p>
      )}
    </div>
  );
}
