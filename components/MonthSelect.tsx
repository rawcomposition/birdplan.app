import React from "react";
import Select from "components/ReactSelectStyled";

type Props = {
  [key: string]: any;
};

export default function MonthSelect({ type, parent, ...props }: Props) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const options = months.map((month, i) => ({ value: i + 1, label: month }));

  return <Select options={options} {...props} />;
}
