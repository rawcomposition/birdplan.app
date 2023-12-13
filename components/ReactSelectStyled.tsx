import React, { forwardRef } from "react";
import ReactSelect from "react-select";

const ReactSelectStyled = forwardRef((props: any, ref: any) => {
  return (
    <ReactSelect
      ref={ref}
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
});

ReactSelectStyled.displayName = "ReactSelectStyled";

export default ReactSelectStyled;
