import React from "react";
import clsx from "clsx";
import Icon from "components/Icon";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  label?: string;
  compact?: boolean;
  align?: "left" | "right";
  className?: string;
};

export default function SelectDropdown<T extends string>({
  value,
  onChange,
  options,
  label,
  compact,
  align = "right",
  className,
}: Props<T>) {
  const [open, setOpen] = React.useState(false);
  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className={clsx("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "inline-flex items-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 whitespace-nowrap",
          compact ? "h-6 gap-1 px-2.5 text-xs" : "h-9 gap-1.5 px-3 text-sm"
        )}
      >
        {label && <span className="text-gray-500">{label}</span>}
        <span className={clsx(label ? "font-semibold text-gray-800" : "font-medium text-gray-700")}>
          {current?.label}
        </span>
        <Icon name="angleDown" className={clsx("text-gray-500", compact ? "text-[9px]" : "text-[10px]")} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-30" />
          <div
            className={clsx(
              "absolute top-full mt-1.5 z-40 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            {options.map((o) => {
              const active = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={clsx(
                    "w-full px-3 py-2 text-left text-sm flex items-center justify-between",
                    active ? "bg-primary/10 text-primary-hover" : "text-gray-800 hover:bg-gray-50"
                  )}
                >
                  <span>{o.label}</span>
                  {active && <Icon name="check" className="text-xs" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
