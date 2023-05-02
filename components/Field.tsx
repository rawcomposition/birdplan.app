import React from "react";

type Props = {
  label: string;
  children: React.ReactNode;
  isOptional?: boolean;
};

export default function Field({ label, isOptional, children }: Props) {
  return (
    <div>
      <label className="flex flex-col gap-1">
        <span>
          {label}
          {isOptional && (
            <span className="rounded-2xl bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 ml-2">optional</span>
          )}
        </span>
        {children}
      </label>
    </div>
  );
}
