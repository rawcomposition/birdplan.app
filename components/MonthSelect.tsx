import React from "react";
import Select from "components/ReactSelectStyled";
import { months } from "lib/helpers";

type Props = {
  [key: string]: any;
};

export default function MonthSelect({ type, parent, ...props }: Props) {
  const options = months.map((month, i) => ({ value: i + 1, label: month }));

  return <Select options={options} {...props} />;
}
