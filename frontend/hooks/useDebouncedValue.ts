import React from "react";

export default function useDebouncedValue<T>(value: T, ms = 300) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timeout);
  }, [value, ms]);

  return debounced;
}
