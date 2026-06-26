import React from "react";
import Field from "components/Field";

type Props = {
  label?: string;
  isOptional?: boolean;
  help?: React.ReactNode;
  className?: string;
  from: React.ReactNode;
  to: React.ReactNode;
};

export default function RangeField({ label, isOptional, help, className, from, to }: Props) {
  return (
    <Field label={label} isOptional={isOptional} help={help} className={className}>
      <div className="flex items-center gap-2.5">
        <div className="flex-1">{from}</div>
        <span className="text-sm font-medium text-gray-400">to</span>
        <div className="flex-1">{to}</div>
      </div>
    </Field>
  );
}
