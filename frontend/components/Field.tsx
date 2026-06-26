import React from "react";
import { Label } from "components/ui/label";
import { formLabelClass } from "lib/formStyles";

type Props = {
  label?: string;
  isOptional?: boolean;
  help?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export default function Field({ label, isOptional, help, className, children }: Props) {
  return (
    <div className={className}>
      {label && (
        <Label className={formLabelClass}>
          {label}
          {isOptional && <span className="font-medium normal-case text-gray-400">optional</span>}
        </Label>
      )}
      {children}
      {help && <p className="mt-2 text-xs text-gray-500">{help}</p>}
    </div>
  );
}
