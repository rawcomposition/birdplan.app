import * as React from "react";

type Props = {
  heading: string;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
};

export default function Expand({ heading, children, className, defaultOpen }: Props) {
  const [open, setOpen] = React.useState(!!defaultOpen);

  return (
    <div className="print:break-inside-avoid bg-gray-900/80 py-2 border-t border-gray-700/80 px-4">
      <div className="flex items-center gap-2 py-1.5 text-gray-300 cursor-pointer" onClick={() => setOpen(!open)}>
        <button type="button" className={`expand-btn ${!open ? "-rotate-90" : ""}`} />
        <h2 className="font-medium text-[15px]">{heading}</h2>
      </div>
      <div
        className={`my-2
        ${open ? "" : "h-0 pointer-events-none hidden"}
        ${className || ""}
      `}
      >
        {children}
      </div>
    </div>
  );
}
