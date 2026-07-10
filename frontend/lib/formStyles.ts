import { StylesConfig } from "react-select";

export const formLabelClass = "text-[11px] font-bold uppercase tracking-[0.12em] text-gray-700";

export const reactSelectBaseStyles: StylesConfig<any> = {
  singleValue: (base) => ({ ...base, color: "#555", fontWeight: "normal", fontSize: "0.875rem" }),
  input: (base) => ({ ...base, fontSize: "1rem" }),
  container: (base) => ({ ...base, fontSize: "0.875rem" }),
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "var(--ring)" : "var(--input)",
    "&:hover": { borderColor: state.isFocused ? "var(--ring)" : "#9ca3af" },
  }),
  menu: (base) => ({ ...base, fontSize: "0.875rem" }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

export const formSelectStyles: StylesConfig<any> = {
  control: (base, state) => ({
    ...base,
    minHeight: 50,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: state.isFocused ? base.borderColor : "#e5e7eb",
    paddingLeft: 6,
    boxShadow: state.isFocused ? "0 0 0 3px rgba(59,130,246,.15)" : "none",
  }),
};
