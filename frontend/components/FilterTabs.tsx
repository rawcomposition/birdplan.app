import React from "react";
import clsx from "clsx";

type Props = {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    label: string;
    value: string;
  }[];
};

export default function FilterTabs({ className, options, value, onChange }: Props) {
  return (
    <div className={clsx("flex gap-2", className)}>
      {options.map((it) => (
        <button
          key={it.value}
          type="button"
          className={clsx(
            "text-xs px-2 py-0.5 rounded-full",
            value === it.value ? "bg-gray-600 text-white font-bold" : "bg-gray-100 text-gray-600"
          )}
          onClick={() => onChange(it.value)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
