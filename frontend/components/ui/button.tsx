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
      "outline-amber":
        "border border-amber-600 bg-transparent text-amber-600 hover:bg-amber-500/5 transition-colors",
      ghost: "hover:bg-muted hover:text-foreground transition-colors",
      danger: "bg-red-600 text-white hover:bg-red-700",
      link: "text-link font-medium",
      "link-danger": "text-red-700 hover:text-red-800",
    },
    size: {
      lg: "text-lg py-2.5 px-4.5",
      md: "text-md py-2 px-5",
      pill: "text-sm py-3 px-6",
      smPill: "text-[14px] py-1.5 px-4",
      sm: "text-[14px] py-1.5 px-2.5",
      xs: "text-[12px] py-0.5 px-1.5",
      none: "",
      icon: "inline-flex size-8 items-center justify-center",
      "icon-lg": "inline-flex size-9 items-center justify-center",
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
  const effectiveSize = variant === "link" ? "none" : size
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
