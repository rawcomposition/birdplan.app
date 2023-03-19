import React from "react";

type Props = {
  type?: string;
  className?: string;
  autoFocus?: boolean;
  [key: string]: any;
};

const Input = React.forwardRef(({ type = "text", className, autoFocus, ...props }: Props, ref: any) => {
  const thisRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (autoFocus) {
      (ref?.current || thisRef.current).focus();
    }
  }, [autoFocus, ref]);
  return (
    <input
      ref={ref || thisRef}
      type={type}
      className={`py-2 px-3 border border-gray-300 focus:ring-slate-500 focus:border-slate-500 outline-blue-500 block w-full shadow-sm sm:text-sm rounded-md outline-offset-0 ${
        className || ""
      }`}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;
