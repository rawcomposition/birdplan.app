import clsx from "clsx";

type Props = {
  className?: string;
  type?: "submit" | "reset" | "button" | undefined;
  disabled?: boolean;
  children: React.ReactNode;
  tooltip?: string;
  active?: boolean;
  [x: string]: any;
};

export default function MapButton({
  className,
  disabled,
  type = "button",
  children,
  tooltip,
  active,
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={clsx(
        className,
        "w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg text-[20px] group relative",
        active ? "text-[#1172ab]" : "text-gray-700",
        disabled ? "opacity-60" : "hover:bg-gray-100"
      )}
      disabled={disabled}
      {...props}
    >
      {children}
      {tooltip && (
        <span className="absolute top-1/2 right-14 sm:left-14 sm:right-auto transform -translate-y-1/2 bg-black/80 text-white text-sm whitespace-nowrap px-2.5 py-1 rounded-lg hidden group-hover:block">
          {tooltip}
        </span>
      )}
    </button>
  );
}
