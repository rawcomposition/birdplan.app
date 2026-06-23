import React from "react";
import { useQuery } from "@tanstack/react-query";

const AVICOMMONS_DOMAIN = "https://static.avicommons.org";

export const useSpeciesImages = () => {
  const { data } = useQuery<Record<string, [string, string]>>({
    queryKey: ["avicommons"],
    queryFn: () => fetch("/avicommons.json").then((res) => res.json()),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 24 * 60 * 60 * 1000,
  });

  const getSpeciesImg = React.useCallback(
    (code: string, size: "240" | "320" | "480" | "900" = "240") => {
      const [key, by] = data?.[code] || [];
      if (!key) return undefined;
      return {
        url: `${AVICOMMONS_DOMAIN}/${code}-${key}-${size}.jpg`,
        by,
      };
    },
    [data]
  );

  return { getSpeciesImg };
};
