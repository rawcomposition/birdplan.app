import clsx from "clsx";

type Props = {
  className?: string;
};

export default function BreadcrumbArrow({ className }: Props) {
  return (
    <svg
      className={clsx("w-2 h-4 text-white/60", className)}
      viewBox="0 0 24 44"
      preserveAspectRatio="none"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z"></path>
    </svg>
  );
}
