import clsx from "clsx";

type Props = {
  percent: number;
  className?: string;
};

export default function FrequencyBar({ percent, className }: Props) {
  return (
    <div className={clsx("w-full h-1.5 rounded-full bg-gray-200 overflow-hidden", className)}>
      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(100, percent)}%` }} />
    </div>
  );
}
