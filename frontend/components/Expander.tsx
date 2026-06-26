import React from "react";
import Icon from "components/Icon";
import { cn } from "lib/utils";

type Props = {
  label: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
};

export default function Expander({ label, defaultOpen = false, className, children }: Props) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className={cn("border-t border-gray-100 pt-1", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 py-3 text-[13px] font-bold text-gray-500 hover:text-gray-700"
      >
        <Icon name="angleDown" className={`text-xs transition-transform ${open ? "" : "-rotate-90"}`} />
        {label}
      </button>
      {open && <div className="mt-1 flex flex-col gap-[22px]">{children}</div>}
    </div>
  );
}
