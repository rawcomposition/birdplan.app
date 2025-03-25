import React from "react";
import AsyncSelect from "react-select/async";
import { Option } from "lib/types";

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
  return (
    <AsyncSelect
      styles={{
        singleValue: (base) => ({
          ...base,
          color: "#555",
          fontWeight: "normal",
          fontSize: "0.875rem",
        }),
        input: (base, state) => ({
          ...base,
          fontSize: "1rem",
        }),
        container: (base, state) => ({
          ...base,
          fontSize: "0.875rem",
        }),
        control: (base, state) => ({
          ...base,
          borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
          "&:hover": {
            borderColor: state.isFocused ? "#3b82f6" : "##9ca3af",
          },
        }),
        menu: (base) => ({ ...base, fontSize: "0.875rem" }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
      {...props}
    />
  );
}
