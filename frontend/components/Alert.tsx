import { clsx } from "clsx";

type Props = {
  children: React.ReactNode;
  className?: string;
  style: "warning" | "error" | "info" | "gray";
};

export default function Alert({ children, className, style }: Props) {
  const styleMap = {
    warning: "bg-amber-100 text-amber-800",
    error: "bg-red-100 text-red-800",
    info: "bg-sky-100 text-sky-800",
    gray: "bg-neutral-100 text-neutral-800",
  };
  return (
    <div className={clsx("text-sm py-2.5 px-3 rounded flex items-center gap-2", styleMap[style], className)}>
      {children}
    </div>
  );
}
