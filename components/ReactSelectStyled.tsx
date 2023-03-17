import ReactSelect from "react-select";

const ReactSelectStyled = (props: any) => {
  return (
    <ReactSelect
      styles={{
        singleValue: (base) => ({
          ...base,
          color: "#555",
          fontWeight: "normal",
          fontSize: "0.875rem",
        }),
        input: (base, state) => ({
          ...base,
          fontSize: "0.875rem",
        }),
        container: (base, state) => ({
          ...base,
          fontSize: "0.875rem",
        }),
        menu: (base) => ({ ...base, fontSize: "0.875rem" }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
      {...props}
    />
  );
};

export default ReactSelectStyled;
