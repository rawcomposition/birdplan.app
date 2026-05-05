import { useQuery } from "@tanstack/react-query";
import { EBIRD_BASE_URL } from "lib/config";
import { parseRegion, RegionFieldsValue } from "lib/region";

type EbirdRegion = { code: string; name: string };

const queryOpts = {
  staleTime: 30 * 60 * 1000,
  gcTime: 60 * 60 * 1000,
  refetchOnWindowFocus: false,
  retry: 2,
};

// Resolve a saved region string into dropdown state, falling back to
// manual mode if parsing or label lookups fail.
export default function useResolvedRegion(region: string | undefined): RegionFieldsValue | null {
  const parsed = region ? parseRegion(region) : null;

  const countriesQuery = useQuery<EbirdRegion[]>({
    queryKey: [`${EBIRD_BASE_URL}/ref/region/list/country/world`],
    enabled: !!parsed,
    ...queryOpts,
  });

  const statesQuery = useQuery<EbirdRegion[]>({
    queryKey: [`${EBIRD_BASE_URL}/ref/region/list/subnational1/${parsed?.countryCode || ""}`],
    enabled: !!parsed && parsed.stateCodes.length > 0,
    ...queryOpts,
  });

  const countyParent = parsed?.stateCodes.length === 1 ? parsed.stateCodes[0] : "";
  const countiesQuery = useQuery<EbirdRegion[]>({
    queryKey: [`${EBIRD_BASE_URL}/ref/region/list/subnational2/${countyParent}`],
    enabled: !!parsed && parsed.countyCodes.length > 0,
    ...queryOpts,
  });

  if (!region) return null;
  const fallbackToManual: RegionFieldsValue = { manualRegion: region, isManualRegion: true };
  if (!parsed) return fallbackToManual;

  if (countriesQuery.isError) return fallbackToManual;
  if (!countriesQuery.data) return null;
  const country = countriesQuery.data.find((c) => c.code === parsed.countryCode);
  if (!country) return fallbackToManual;

  const result: RegionFieldsValue = {
    country: { value: country.code, label: country.name },
    manualRegion: "",
    isManualRegion: false,
  };

  if (parsed.stateCodes.length === 0) return result;

  if (statesQuery.isError) return fallbackToManual;
  if (!statesQuery.data) return null;
  const stateOptions = parsed.stateCodes
    .map((code) => statesQuery.data!.find((s) => s.code === code))
    .filter((s): s is EbirdRegion => !!s);
  if (stateOptions.length !== parsed.stateCodes.length) return fallbackToManual;
  result.states = stateOptions.map((s) => ({ value: s.code, label: s.name }));

  if (parsed.countyCodes.length === 0) return result;

  if (countiesQuery.isError) return fallbackToManual;
  if (!countiesQuery.data) return null;
  const countyOptions = parsed.countyCodes
    .map((code) => countiesQuery.data!.find((c) => c.code === code))
    .filter((c): c is EbirdRegion => !!c);
  if (countyOptions.length !== parsed.countyCodes.length) return fallbackToManual;
  result.counties = countyOptions.map((c) => ({ value: c.code, label: c.name }));

  return result;
}
