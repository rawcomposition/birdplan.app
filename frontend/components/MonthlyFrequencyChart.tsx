import React from "react";
import clsx from "clsx";
import { fullMonths, months as monthAbbrev } from "lib/helpers";

const MONTH_INITIALS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

type Props = {
  monthly: number[]; // 12 entries, % frequency per month
  startMonth?: number; // 1-indexed, trip start
  endMonth?: number; // 1-indexed, trip end
  className?: string;
};

function isInRange(monthIdx: number, start?: number, end?: number) {
  if (!start || !end) return false;
  const m = monthIdx + 1;
  if (start <= end) return m >= start && m <= end;
  return m >= start || m <= end;
}

export default function MonthlyFrequencyChart({ monthly, startMonth, endMonth, className }: Props) {
  const [hover, setHover] = React.useState<number | null>(null);
  const max = Math.max(...monthly, 1);

  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold mb-2">
        Frequency by month
        {hover !== null && (
          <span className="ml-2 normal-case tracking-normal text-gray-700 font-medium">
            {fullMonths[hover]} · {monthly[hover]}%
          </span>
        )}
      </div>
      <div className="flex items-end gap-1.5 h-16">
        {monthly.map((v, i) => {
          const h = Math.max(3, (v / max) * 64);
          const inRange = isInRange(i, startMonth, endMonth);
          const isHover = hover === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="flex-1 flex flex-col items-center gap-1.5 cursor-default min-w-0"
              title={`${monthAbbrev[i]} · ${monthly[i]}%`}
            >
              <div
                className={clsx(
                  "w-full rounded-sm transition-colors",
                  inRange ? "bg-sky-600" : isHover ? "bg-gray-600" : "bg-gray-300"
                )}
                style={{ height: `${h}px` }}
              />
              <div
                className={clsx(
                  "text-[10.5px]",
                  inRange ? "text-sky-700 font-bold" : "text-gray-500 font-medium"
                )}
              >
                {MONTH_INITIALS[i]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
