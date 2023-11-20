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
    lg: "text-lg py-[0.625rem] px-[1.125rem]",
    md: "text-md py-2 px-5",
    smPill: "text-[14px] py-1.5 px-4",
    sm: "text-[14px] py-1.5 px-2.5",
    xs: "text-[12px] py-0.5 px-1.5",
  };

  const colors: ColorTypes = {
    default: "bg-gray-300 text-gray-700",
    gray: "text-gray-600 bg-gray-100",
    primary: "bg-blue-500 text-white hover:bg-blue-600 transition-colors",
    pillPrimary: "bg-blue-500 text-white hover:bg-blue-600 transition-colors rounded-full",
    pillOutlineGray:
      "bg-transparent text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors rounded-full",
    pillWhite: "bg-white text-gray-600 hover:bg-gray-50 transition-colors rounded-full shadow-md",
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
