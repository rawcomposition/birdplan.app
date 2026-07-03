import React from "react";
import { cn } from "lib/utils";
import Icon from "components/Icon";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function SlideOver({ open, onClose, children }: Props) {
  return (
    <div
      inert={!open}
      className={cn(
        "absolute inset-0 z-10 flex h-full w-full flex-col bg-card transition-transform duration-300 ease-out",
        open ? "translate-x-0" : "translate-x-full"
      )}
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 border-b bg-muted px-2 py-1 text-sm font-bold"
        onClick={onClose}
      >
        <Icon name="angleLeft" /> Back
      </button>
      <div className="grow overflow-y-auto px-6 py-4">{children}</div>
    </div>
  );
}
