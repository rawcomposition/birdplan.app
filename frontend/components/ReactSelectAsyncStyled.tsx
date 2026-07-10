import React from "react";
import AsyncSelect from "react-select/async";
import { Option } from "lib/types";
import { reactSelectBaseStyles } from "lib/formStyles";

export type SelectProps = {
  value?: Option | Option[];
  isLoading?: boolean;
  isDisabled?: boolean;
  isMulti?: boolean;
  isClearable?: boolean;
  instanceId?: string;
  placeholder?: string;
  onChange?: (value: any) => void;
  menuPortalTarget?: HTMLElement | null;
  className?: string;
  loadOptions: (input: string, callback: (options: Option[]) => void) => void;
  noOptionsMessage?: (input: any) => string;
};

export default function ReactSelectAsyncStyled(props: SelectProps) {
  return <AsyncSelect styles={reactSelectBaseStyles} {...props} />;
}
