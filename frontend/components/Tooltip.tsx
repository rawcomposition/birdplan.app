import React from "react";
import { createPortal } from "react-dom";

type Props = {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function Tooltip({ content, children, className }: Props) {
  const triggerRef = React.useRef<HTMLSpanElement>(null);
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);

  const show = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setCoords({ top: rect.top, left: rect.left + rect.width / 2 });
  };

  const hide = () => setCoords(null);

  return (
    <span ref={triggerRef} className={className} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {coords &&
        createPortal(
          <span
            role="tooltip"
            style={{ top: coords.top, left: coords.left }}
            className="pointer-events-none fixed z-50 -mt-2 max-w-[16rem] -translate-x-1/2 -translate-y-full rounded-lg bg-gray-900 px-2.5 py-1.5 text-center text-xs font-medium leading-snug text-white shadow-lg"
          >
            {content}
          </span>,
          document.body
        )}
    </span>
  );
}
