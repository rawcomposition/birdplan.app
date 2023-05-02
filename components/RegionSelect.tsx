import React from "react";
import Select from "components/ReactSelectStyled";
import toast from "react-hot-toast";
import { Option } from "lib/types";

type Props = {
  type: "country" | "subnational1" | "subnational2";
  parent?: string;
  [key: string]: any;
};

export default function RegionSelect({ type, parent, ...props }: Props) {
  const [options, setOptions] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!parent || !type) return;
    (async () => {
      setLoading(true);
      const res = await fetch(
        `https://api.ebird.org/v2/ref/region/list/${type}/${parent}?key=${process.env.NEXT_PUBLIC_EBIRD_KEY}&fmt=json`
      );
      setLoading(false);
      if (!res.ok) return toast.error("Failed to fetch regions");
      const data = await res.json();
      setOptions(data.map((it: any) => ({ value: it.code, label: it.name })));
    })();
  }, [type, parent]);

  return (
    <Select
      instanceId={`region-select-${type}`}
      placeholder="Select..."
      options={options}
      isLoading={loading}
      isDisabled={!loading && !options.length}
      {...props}
    />
  );
}
