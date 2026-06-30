import * as React from "react"
import { Link } from "react-router-dom"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "lib/utils"
import Icon from "components/Icon"

const buttonVariants = cva("font-semibold rounded", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary-hover transition-colors",
      secondary: "bg-secondary text-secondary-foreground",
      outline: "border border-input text-secondary-foreground hover:bg-secondary transition-colors",
      "outline-white":
        "border border-gray-200 bg-white text-gray-700 rounded-full shadow-xs hover:bg-gray-50 transition-colors",
      ghost: "hover:bg-muted hover:text-foreground transition-colors",
      nav: "font-medium text-gray-600 hover:bg-slate-300 transition-colors",
      danger: "bg-red-600 text-white hover:bg-red-700",
      link: "text-link font-medium",
      "link-danger": "text-sm font-medium text-red-600 hover:text-red-600",
    },
    size: {
      xl: "text-sm py-3 px-6",
      lg: "text-lg py-2.5 px-4.5",
      md: "text-md py-2 px-5",
      sm: "text-[14px] py-1.5 px-2.5",
      xs: "text-[12px] py-0.5 px-1.5",
      toolbar: "inline-flex items-center gap-1.5 h-9 px-3.5 text-sm font-medium",
      none: "",
      icon: "inline-flex size-8 items-center justify-center text-sm",
      "icon-lg": "inline-flex size-9 items-center justify-center text-lg",
    },
    shape: {
      default: "",
      pill: "rounded-full",
    },
  },
  compoundVariants: [
    { variant: "default", shape: "pill", class: "shadow-lg shadow-primary/30" },
    { variant: "outline", shape: "pill", class: "bg-transparent hover:bg-gray-50" },
  ],
  defaultVariants: {
    variant: "default",
    size: "md",
    shape: "default",
  },
})

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    href?: string
    target?: React.HTMLAttributeAnchorTarget
    rel?: string
    loading?: boolean
    loadingText?: React.ReactNode
  }

function Button({
  className,
  variant,
  size,
  shape,
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
  const effectiveSize = variant === "link" || variant === "link-danger" ? "none" : size
  const isDisabled = disabled || loading
  const classes = cn(
    buttonVariants({ variant, size: effectiveSize, shape }),
    isDisabled && "opacity-60",
    className
  )

  const content = loading ? (
    <span className="inline-flex items-center justify-center gap-2">
      <Icon name="loading" className="animate-spin" />
      {loadingText}
    </span>
  ) : (
    children
  )

  if (href) {
    return /^(https?:|mailto:|tel:|om:)/.test(href) ? (
      <a href={href} target={target} rel={rel} className={classes} {...(props as Record<string, unknown>)}>
        {content}
      </a>
    ) : (
      <Link to={href} className={classes} {...(props as Record<string, unknown>)}>
        {content}
      </Link>
    )
  }

  return (
    <ButtonPrimitive
      data-slot="button"
      type={type}
      className={classes}
      disabled={isDisabled}
      {...props}
    >
      {content}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
