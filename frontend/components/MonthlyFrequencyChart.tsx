import React from "react";
import clsx from "clsx";
import { fullMonths } from "lib/helpers";

const MONTH_INITIALS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

type Props = {
  monthly: number[];
  startMonth?: number;
  endMonth?: number;
  variant?: "default" | "mini";
  className?: string;
};

function isInRange(monthIdx: number, start?: number, end?: number) {
  if (!start || !end) return false;
  const m = monthIdx + 1;
  if (start <= end) return m >= start && m <= end;
  return m >= start || m <= end;
}

export default function MonthlyFrequencyChart({
  monthly,
  startMonth,
  endMonth,
  variant = "default",
  className,
}: Props) {
  const [hover, setHover] = React.useState<number | null>(null);
  const max = Math.max(...monthly, 1);
  const isMini = variant === "mini";
  const barHeight = isMini ? 24 : 64;

  return (
    <div className={className}>
      <div
        className={clsx("flex items-end relative", isMini ? "gap-0.5 h-6" : "gap-1.5 h-16")}
        onMouseLeave={() => setHover(null)}
      >
        {monthly.map((v, i) => {
          const h = Math.max(isMini ? 2 : 3, (v / max) * barHeight);
          const inRange = isInRange(i, startMonth, endMonth);
          const isHover = hover === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHover(i)}
              className={clsx(
                "flex-1 flex flex-col items-center cursor-default min-w-0",
                isMini ? "gap-0" : "gap-1.5"
              )}
            >
              <div className="w-full relative" style={{ height: `${h}px` }}>
                <div
                  className={clsx(
                    "w-full h-full transition-colors",
                    isMini ? "rounded-[1px]" : "rounded-md",
                    inRange
                      ? isHover
                        ? "bg-sky-700"
                        : "bg-sky-600"
                      : isHover
                        ? "bg-gray-600"
                        : "bg-gray-300"
                  )}
                />
                {isHover && (
                  <div
                    className={clsx(
                      "absolute bottom-full mb-1.5 pointer-events-none whitespace-nowrap bg-gray-900 text-white text-[11px] font-medium rounded px-2 py-1 shadow-md z-10",
                      isMini || (i > 1 && i < 10)
                        ? "left-1/2 -translate-x-1/2"
                        : i <= 1
                          ? "left-0"
                          : "right-0"
                    )}
                  >
                    {fullMonths[i]} · {Math.round(monthly[i])}%
                  </div>
                )}
              </div>
              {!isMini && (
                <div
                  className={clsx(
                    "text-[10.5px] mt-1.5",
                    inRange ? "text-sky-700 font-bold" : "text-gray-500 font-medium"
                  )}
                >
                  {MONTH_INITIALS[i]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
