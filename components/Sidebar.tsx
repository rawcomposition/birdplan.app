import clsx from "clsx";
import React from "react";

type Props = {
  className?: string;
  children?: React.ReactNode;
  noPadding?: boolean;
  widthClass?: string;
  noAnimation?: boolean;
  extraMenuHeight?: number;
};

export default function Sidebar({ children, className, noPadding, widthClass, noAnimation, extraMenuHeight }: Props) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <aside
      className={clsx(
        `h-[calc(100%_-_60px_-_${extraMenuHeight || 0}px)]`,
        "flex flex-shrink-0 flex-col md:h-full bg-[#1e263a] fixed shadow-2xl md:shadow-none z-10",
        !sidebarOpen && "-translate-x-full",
        widthClass || "w-80",
        noAnimation ? "" : "transition-all",
        className
      )}
    >
      <div className={clsx("overflow-y-auto dark-scrollbar", noPadding ? "" : "p-6")}>{children}</div>
      <button
        type="button"
        onClick={() => setSidebarOpen((prev) => !prev)}
        className="absolute top-4 -right-7 bg-[#1e263a] rounded-r-lg py-3 px-1"
      >
        <svg
          className={clsx("w-5 h-5 text-white", sidebarOpen ? "rotate-90" : "-rotate-90")}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </aside>
  );
}
