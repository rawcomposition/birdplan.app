import React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "lib/utils";

const buttonVariants = cva("font-semibold rounded", {
  variants: {
    color: {
      default: "bg-gray-300 text-gray-700",
      gray: "text-secondary-foreground bg-secondary",
      red: "bg-red-600 hover:bg-red-700 text-white",
      grayOutline: "border border-input hover:bg-secondary transition-colors text-secondary-foreground",
      primary: "bg-primary text-primary-foreground hover:bg-primary-hover transition-colors",
      pillPrimary: "bg-primary text-primary-foreground hover:bg-primary-hover transition-colors rounded-full",
      pillOutlineGray:
        "bg-transparent text-secondary-foreground border border-input hover:bg-gray-50 transition-colors rounded-full",
      pillWhite: "bg-white text-secondary-foreground hover:bg-gray-50 transition-colors rounded-full shadow-md",
    },
    size: {
      lg: "text-lg py-[0.625rem] px-[1.125rem]",
      md: "text-md py-2 px-5",
      smPill: "text-[14px] py-1.5 px-4",
      sm: "text-[14px] py-1.5 px-2.5",
      xs: "text-[12px] py-0.5 px-1.5",
      xsPill: "text-[12px] py-1.5 px-3",
    },
  },
  defaultVariants: {
    color: "default",
    size: "md",
  },
});

type Props = VariantProps<typeof buttonVariants> & {
  className?: string;
  type?: "submit" | "reset" | "button" | undefined;
  disabled?: boolean;
  href?: string;
  children: React.ReactNode;
  [x: string]: any;
};

export default function Button({
  className,
  disabled,
  type = "button",
  color,
  size,
  href,
  children,
  ...props
}: Props) {
  const classes = cn(buttonVariants({ color, size }), disabled && "opacity-60", className);

  return href ? (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  ) : (
    <button type={type} className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
