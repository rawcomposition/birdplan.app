import { StylesConfig } from "react-select";

export const formLabelClass = "mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-gray-700";

export const formSelectStyles: StylesConfig<any> = {
  control: (base, state) => ({
    ...base,
    minHeight: 50,
    borderRadius: 13,
    borderWidth: 1.5,
    paddingLeft: 6,
    boxShadow: state.isFocused ? "0 0 0 3px rgba(59,130,246,.15)" : "none",
  }),
};
