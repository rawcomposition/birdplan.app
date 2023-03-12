import React from "react";

type Props = {
  type?: string;
  className?: string;
  [key: string]: any;
};

const Input = React.forwardRef(({ type = "text", className, ...props }: Props, ref: any) => (
  <input
    ref={ref}
    type={type}
    className={`py-2 px-3 mt-2 border border-gray-300 focus:ring-slate-500 focus:border-slate-500 block w-full shadow-sm sm:text-sm rounded-md outline-offset-0 ${
      className || ""
    }`}
    {...props}
  />
));

Input.displayName = "Input";

export default Input;
