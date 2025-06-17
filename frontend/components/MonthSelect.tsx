import React from "react";
import Select, { SelectProps } from "components/ReactSelectStyled";
import { months } from "lib/helpers";

type Props = Omit<SelectProps, "options">;

export default function MonthSelect(props: Props) {
  const options = months.map((month, i) => ({ value: (i + 1).toString(), label: month }));

  return <Select options={options} {...props} />;
}
