import React from "react";

type PropsT = {
  onFocus?: () => void;
  onBlur?: () => void;
};

export const useWindowActive = ({ onFocus, onBlur }: PropsT = {}) => {
  const [windowIsFocused, setWindowIsFocused] = React.useState(true);

  React.useEffect(() => {
    setWindowIsFocused(document?.visibilityState === "visible");

    const handleVisibilityChange = () => {
      setWindowIsFocused(document.visibilityState === "visible");
      if (document.visibilityState === "visible" && onFocus) onFocus();
      else if (document.visibilityState !== "visible" && onBlur) onBlur();
    };

    document?.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document?.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return windowIsFocused;
};
