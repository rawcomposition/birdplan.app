import React from "react";
import { Label } from "components/ui/label";
import { formLabelClass } from "lib/formStyles";

type Props = {
  label?: string;
  isOptional?: boolean;
  rightButton?: React.ReactNode;
  help?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export default function Field({ label, isOptional, rightButton, help, className, children }: Props) {
  return (
    <div className={className}>
      {(label || rightButton) && (
        <div className="mb-2 flex items-center justify-between gap-2">
          {label ? (
            <Label className={formLabelClass}>
              {label}
              {isOptional && <span className="ml-1 font-medium normal-case text-gray-400">optional</span>}
            </Label>
          ) : (
            <span />
          )}
          {rightButton}
        </div>
      )}
      {children}
      {help && <p className="mt-2 text-xs text-gray-500">{help}</p>}
    </div>
  );
}
