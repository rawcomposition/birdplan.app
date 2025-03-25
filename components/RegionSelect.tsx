import React from "react";
import Select, { SelectProps } from "components/ReactSelectStyled";
import { useQuery } from "@tanstack/react-query";
import { EBIRD_BASE_URL } from "lib/config";

type Props = Omit<SelectProps, "options" | "isLoading" | "isDisabled" | "instanceId" | "placeholder"> & {
  type: "country" | "subnational1" | "subnational2";
  parent?: string;
};

type Region = {
  code: string;
  name: string;
};

export default function RegionSelect({ type, parent, ...props }: Props) {
  const { data, isFetching } = useQuery<Region[]>({
    queryKey: [`${EBIRD_BASE_URL}/ref/region/list/${type}/${parent}`, { key: process.env.NEXT_PUBLIC_EBIRD_KEY }],
    enabled: !!type && !!parent,
    meta: {
      errorMessage: "Failed to load regions",
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const options = data?.map((it) => ({ value: it.code, label: it.name })) || [];

  return (
    <Select
      instanceId={`region-select-${type}`}
      placeholder="Select..."
      options={options}
      isLoading={isFetching}
      isDisabled={!isFetching && !options.length}
      {...props}
    />
  );
}
