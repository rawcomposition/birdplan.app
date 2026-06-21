import React from "react";
import { useBlocker } from "react-router-dom";

export default function useConfirmNavigation(isDirty: boolean) {
  useBlocker(({ currentLocation, nextLocation }) => {
    if (!isDirty || currentLocation.pathname === nextLocation.pathname) return false;
    return !window.confirm("Are you sure? Changes you made will not be saved.");
  });

  React.useEffect(() => {
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleWindowClose);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  }, [isDirty]);
}
