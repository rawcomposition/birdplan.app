import React from "react";

type Props = {
  type?: string;
  className?: string;
  autoFocus?: boolean;
  isTextarea?: boolean;
  [key: string]: any;
};

const Input = React.forwardRef(({ type = "text", isTextarea, className, autoFocus, ...props }: Props, ref: any) => {
  const thisRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (autoFocus) {
      (ref?.current || thisRef.current).focus();
    }
  }, [autoFocus, ref]);

  const Tag = isTextarea ? "textarea" : "input";

  return (
    <Tag ref={ref || thisRef} type={isTextarea ? undefined : type} className={`input ${className || ""}`} {...props} />
  );
});

Input.displayName = "Input";

export default Input;
