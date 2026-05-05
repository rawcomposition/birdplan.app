import { Option } from "lib/types";

export const largeRegions = ["MX", "US", "CA", "AU"];

export type RegionFieldsValue = {
  country?: Option;
  states?: Option[];
  counties?: Option[];
  manualRegion: string;
  isManualRegion: boolean;
};

export const emptyRegionFieldsValue: RegionFieldsValue = {
  manualRegion: "",
  isManualRegion: false,
};

export const requiresSubregion = (countryCode: string | undefined) =>
  largeRegions.includes(countryCode || "");

type ParsedRegion = {
  countryCode: string;
  stateCodes: string[];
  countyCodes: string[];
};

export const parseRegion = (region: string): ParsedRegion | null => {
  if (!region) return null;
  const codes = region
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (codes.length === 0) return null;

  const segments = codes.map((c) => c.split("-"));
  const depth = segments[0].length;
  if (![1, 2, 3].includes(depth)) return null;
  if (!segments.every((s) => s.length === depth)) return null;

  const countryCode = segments[0][0];
  if (!segments.every((s) => s[0] === countryCode)) return null;

  if (depth === 1) {
    if (codes.length !== 1) return null;
    // A bare large-country code (US/CA/MX/AU) is always manually entered —
    // the picker requires a subregion for these. Keep it in manual mode so
    // it remains save-able as-is.
    if (largeRegions.includes(countryCode)) return null;
    return { countryCode, stateCodes: [], countyCodes: [] };
  }

  if (depth === 2) {
    return { countryCode, stateCodes: codes, countyCodes: [] };
  }

  const stateCode = `${segments[0][0]}-${segments[0][1]}`;
  if (!segments.every((s) => `${s[0]}-${s[1]}` === stateCode)) return null;
  return { countryCode, stateCodes: [stateCode], countyCodes: codes };
};

export const getRegionCode = (v: RegionFieldsValue): string | null => {
  if (v.isManualRegion) {
    if (!v.manualRegion) return null;
    return v.manualRegion.trim().replaceAll(" ", "");
  }
  if (v.counties && v.counties.length > 0)
    return v.counties
      .map((it) => it.value)
      .sort()
      .join(",");
  if (v.states && v.states.length > 0)
    return v.states
      .map((it) => it.value)
      .sort()
      .join(",");
  if (v.country) return v.country.value;
  return null;
};

export const validateRegionFields = (v: RegionFieldsValue): string | null => {
  const code = getRegionCode(v);
  if (!code) return "Please select a region";
  if (!v.isManualRegion && requiresSubregion(v.country?.value) && !v.states?.length)
    return "Please select a state/province";
  return null;
};
