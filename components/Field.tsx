import React from "react";

type Props = {
  label: string;
  children: React.ReactNode;
};

export default function Field({ label, children }: Props) {
  return (
    <div>
      <label className="flex flex-col gap-1">
        {label}
        {children}
      </label>
    </div>
  );
}
