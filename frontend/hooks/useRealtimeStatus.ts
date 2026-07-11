import React from "react";
import { onlineManager } from "@tanstack/react-query";

export default function useRealtimeStatus() {
  const isOnline = React.useSyncExternalStore(
    (callback) => onlineManager.subscribe(callback),
    () => onlineManager.isOnline(),
    () => true
  );

  return { isOnline };
}
