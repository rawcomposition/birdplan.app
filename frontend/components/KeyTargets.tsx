import { formatFrequency } from "lib/helpers";
import type { KeyTarget } from "hooks/useKeyTargets";

type Props = {
  targets: KeyTarget[];
};

export default function KeyTargets({ targets }: Props) {
  if (!targets.length) return null;

  return (
    <div className="mt-4 rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5 print:break-inside-avoid">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Best chance on this day
      </div>
      <ul className="flex flex-col gap-1">
        {targets.map((it) => (
          <li key={it.code} className="flex items-baseline gap-2 text-[13px]">
            <span className="shrink-0 font-medium text-foreground">{it.name}</span>
            <span className="truncate text-muted-foreground">{it.hotspotNames.join(", ")}</span>
            <span className="ml-auto shrink-0 tabular-nums text-muted-foreground">
              {formatFrequency(it.frequency)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
