import * as React from "react";
import { DispatchAction, Address } from "lib/types";

type Props = {
  dispatch: React.Dispatch<DispatchAction>;
  seen: string[];
  showSeen: boolean;
  address?: Address;
  radius: number;
};

export default function useSyncLocalStorage({ dispatch, seen, showSeen, address, radius }: Props) {
  React.useEffect(() => {
    console.log("Initializing from localhost");

    const showSeen = window.localStorage.getItem("showSeen");
    const address = window.localStorage.getItem("address");
    const radius = window.localStorage.getItem("radius");
    const seen = window.localStorage.getItem("seen");

    if (showSeen === "false" || showSeen === "true") {
      dispatch({ type: "show_seen", payload: showSeen === "true" });
    }

    if (address) {
      try {
        dispatch({ type: "set_address", payload: JSON.parse(address) });
      } catch (e) {}
    }

    if (radius) {
      dispatch({ type: "set_radius", payload: radius });
    }

    if (seen) {
      const seenArray = JSON.parse(seen);
      if (Array.isArray(seenArray) && seenArray.length > 0) {
        dispatch({ type: "set_seen", payload: seenArray });
      }
    }

    dispatch({ type: "set_cacheRestored" });
  }, [dispatch]);

  React.useEffect(() => {
    window.localStorage.setItem("seen", JSON.stringify(seen));
    window.localStorage.setItem("address", JSON.stringify(address));
    window.localStorage.setItem("showSeen", showSeen.toString());
    window.localStorage.setItem("radius", radius.toString());
  });
}
