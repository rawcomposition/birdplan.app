import React, { forwardRef } from "react";
import ReactSelect, { StylesConfig } from "react-select";
import { Option } from "lib/types";

export type SelectProps = {
  options: Option[];
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
  styles?: StylesConfig<any>;
};

const ReactSelectStyled = forwardRef(({ styles: override, ...props }: SelectProps, ref: any) => {
  const baseStyles: StylesConfig<any> = {
    singleValue: (base) => ({
      ...base,
      color: "#555",
      fontWeight: "normal",
      fontSize: "0.875rem",
    }),
    input: (base) => ({
      ...base,
      fontSize: "1rem",
    }),
    container: (base) => ({
      ...base,
      fontSize: "0.875rem",
    }),
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "var(--ring)" : "var(--input)",
      "&:hover": {
        borderColor: state.isFocused ? "var(--ring)" : "#9ca3af",
      },
    }),
    menu: (base) => ({ ...base, fontSize: "0.875rem" }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  const mergedStyles: StylesConfig<any> = override
    ? Object.keys(override).reduce((acc, key) => {
        const baseFn = (baseStyles as any)[key];
        const overrideFn = (override as any)[key];
        (acc as any)[key] = (base: any, state: any) =>
          overrideFn(baseFn ? baseFn(base, state) : base, state);
        return acc;
      }, { ...baseStyles })
    : baseStyles;

  return (
    <ReactSelect
      ref={ref}
      styles={mergedStyles}
      {...props}
    />
  );
});

ReactSelectStyled.displayName = "ReactSelectStyled";

export default ReactSelectStyled;
