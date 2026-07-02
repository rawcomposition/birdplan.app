import * as React from "react";
import { Link } from "react-router-dom";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "lib/utils";
import Icon from "components/Icon";

const buttonVariants = cva("inline-flex items-center justify-center gap-2 font-semibold rounded-full", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary-hover transition-colors",
      secondary: "bg-secondary text-secondary-foreground",
      outline: "border border-input text-secondary-foreground bg-transparent hover:bg-muted/50 transition-colors",
      "outline-white": "border border-border bg-card text-secondary-foreground shadow-xs hover:bg-muted/50 transition-colors",
      ghost: "hover:bg-muted hover:text-foreground transition-colors",
      nav: "font-medium text-secondary-foreground hover:bg-foreground/10 transition-colors",
      danger: "bg-destructive text-destructive-foreground hover:bg-destructive-hover",
      link: "inline text-link font-medium",
      "link-danger": "inline text-sm font-medium text-destructive hover:text-destructive",
    },
    size: {
      lg: "text-base py-3 px-6",
      md: "py-2 px-5",
      sm: "gap-1.5 h-9 px-3.5 text-sm font-medium",
      xs: "text-xs py-1.5 px-2.5 font-medium",
      none: "",
      icon: "size-8 text-sm",
      "icon-lg": "size-9 text-lg",
    },
  },
  compoundVariants: [{ variant: "default", size: "lg", class: "shadow-lg shadow-primary/30" }],
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

type ButtonSize = Exclude<NonNullable<VariantProps<typeof buttonVariants>["size"]>, "none">;

type ButtonProps = ButtonPrimitive.Props &
  Omit<VariantProps<typeof buttonVariants>, "size"> & {
    size?: ButtonSize;
    href?: string;
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;
    loading?: boolean;
    loadingText?: React.ReactNode;
  };

function Button({
  className,
  variant,
  size,
  href,
  target,
  rel,
  loading,
  loadingText,
  disabled,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const effectiveSize = variant === "link" || variant === "link-danger" ? "none" : size;
  const isDisabled = disabled || loading;
  const classes = cn(buttonVariants({ variant, size: effectiveSize }), isDisabled && "opacity-60", className);

  const content = loading ? (
    <span className="inline-flex items-center justify-center gap-2">
      <Icon name="loading" className="animate-spin" />
      {loadingText}
    </span>
  ) : (
    children
  );

  if (href) {
    return /^(https?:|mailto:|tel:|om:)/.test(href) ? (
      <a href={href} target={target} rel={rel} className={classes} {...(props as Record<string, unknown>)}>
        {content}
      </a>
    ) : (
      <Link to={href} className={classes} {...(props as Record<string, unknown>)}>
        {content}
      </Link>
    );
  }

  return (
    <ButtonPrimitive data-slot="button" type={type} className={classes} disabled={isDisabled} {...props}>
      {content}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
