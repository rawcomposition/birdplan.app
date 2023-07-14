import React from "react";
import Select from "components/ReactSelectStyled";
import { useQuery } from "@tanstack/react-query";

type Props = {
  type: "country" | "subnational1" | "subnational2";
  parent?: string;
  [key: string]: any;
};

type Region = {
  code: string;
  name: string;
};

export default function RegionSelect({ type, parent, ...props }: Props) {
  const { data, isFetching } = useQuery<Region[]>({
    queryKey: [
      `https://api.ebird.org/v2/ref/region/list/${type}/${parent}`,
      { key: process.env.NEXT_PUBLIC_EBIRD_KEY },
    ],
    enabled: !!type && !!parent,
    meta: {
      errorMessage: "Failed to load regions",
    },
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
