import { Button } from "components/ui/button";

type Props = {
  value: number;
  onChange: (n: number) => void;
  steps: number[];
  min: number;
};

export default function MinStepper({ value, onChange, steps, min }: Props) {
  const next = steps.find((s) => s > value) ?? value + 100;
  const below = steps.filter((s) => s < value);
  const prev = below.length > 0 ? below[below.length - 1] : Math.max(min, value - 100);

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-xs text-secondary-foreground">
      <span>Min</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(prev)}
        className="size-6 rounded text-secondary-foreground"
        aria-label="Decrease"
      >
        −
      </Button>
      <span className="min-w-[22px] text-center font-bold text-foreground">{value}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(next)}
        className="size-6 rounded text-secondary-foreground"
        aria-label="Increase"
      >
        +
      </Button>
    </div>
  );
}
