import React from "react";
import clsx from "clsx";

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function Search({ value, onChange, className }: Props) {
  return (
    <div className={clsx("relative", className)}>
      <input
        type="search"
        className="w-full px-3 py-[5px] text-gray-700 sm:text-[13px] border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500 outline-blue-500 outline-offset-0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search"
      />
    </div>
  );
}
