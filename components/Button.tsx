import clsx from "clsx";
import Link from "next/link";

type Props = {
  className?: string;
  color?: string;
  size?: string;
  type?: "submit" | "reset" | "button" | undefined;
  disabled?: boolean;
  href?: string;
  children: React.ReactNode;
  [x: string]: any;
};

type ColorTypes = {
  [x: string]: string;
};

type SizeTypes = {
  [x: string]: string;
};

export default function Button({
  className,
  disabled,
  type = "button",
  color = "default",
  size = "md",
  href,
  children,
  ...props
}: Props) {
  const baseClasses = "font-semibold rounded";

  const sizes: SizeTypes = {
    lg: "text-md py-[0.625rem] px-[1.125rem]",
    md: "text-sm py-[0.625rem] px-4",
    sm: "text-[13px] py-1 px-2",
    xs: "text-[12px] py-0.5 px-1.5",
  };

  const colors: ColorTypes = {
    default: "bg-gray-300 text-gray-700",
    gray: "text-gray-600 bg-gray-100",
  };

  const colorClasses = colors[color];
  const sizeClasses = sizes[size];

  return href ? (
    <Link
      href={href}
      className={clsx(className, baseClasses, sizeClasses, colorClasses, disabled ? "opacity-60" : "")}
      {...props}
    >
      {children}
    </Link>
  ) : (
    <button
      type={type}
      className={clsx(className, baseClasses, sizeClasses, colorClasses, disabled ? "opacity-60" : "")}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
