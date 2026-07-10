import React, { forwardRef } from "react";
import ReactSelect, { StylesConfig } from "react-select";
import { Option } from "lib/types";
import { reactSelectBaseStyles } from "lib/formStyles";

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
  const mergedStyles: StylesConfig<any> = override
    ? Object.keys(override).reduce((acc, key) => {
        const baseFn = (reactSelectBaseStyles as any)[key];
        const overrideFn = (override as any)[key];
        (acc as any)[key] = (base: any, state: any) =>
          overrideFn(baseFn ? baseFn(base, state) : base, state);
        return acc;
      }, { ...reactSelectBaseStyles })
    : reactSelectBaseStyles;

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
