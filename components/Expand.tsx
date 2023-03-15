import * as React from "react";

type Props = {
  heading: string;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
  count?: number;
};

export default function Expand({ heading, children, className, defaultOpen, count }: Props) {
  const [open, setOpen] = React.useState(!!defaultOpen);

  return (
    <div className="print:break-inside-avoid bg-gray-900/80 py-2 border-t border-gray-700/80 px-4">
      <div className="flex items-center gap-2 py-1.5 text-gray-300 cursor-pointer" onClick={() => setOpen(!open)}>
        <button type="button" className={`expand-btn ${!open ? "-rotate-90" : ""}`} />
        <div className="flex justify-between items-center flex-1">
          <h3 className="font-medium text-[15px] flex justify-between">{heading}</h3>
          {count && <span className="text-gray-400 text-[13px]">{count.toLocaleString()}</span>}
        </div>
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
