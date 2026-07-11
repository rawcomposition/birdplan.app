import React from "react";
import { useModal } from "stores/modals";

export default function useCloseOnOutsideClick() {
  const { close } = useModal();
  return (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (
      !target.closest("button") &&
      !target.closest("a") &&
      !target.closest('[role="button"]') &&
      !target.closest(".mapboxgl-canvas")
    ) {
      close();
    }
  };
}
