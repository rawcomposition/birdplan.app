import React from "react";
import Select, { SelectProps } from "components/ReactSelectStyled";
import { months } from "lib/helpers";
import { formSelectStyles } from "lib/formStyles";

type Props = Omit<SelectProps, "options">;

export default function MonthSelect({ styles = formSelectStyles, ...props }: Props) {
  const options = months.map((month, i) => ({ value: (i + 1).toString(), label: month }));

  return <Select options={options} styles={styles} {...props} />;
}
