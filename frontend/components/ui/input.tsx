import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "lib/utils"

const inputVariants = cva(
  "w-full min-w-0 bg-card text-foreground transition-colors outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
  {
    variants: {
      size: {
        default: "h-[50px] rounded-[13px] border-[1.5px] border-border px-4 text-[15px] font-medium",
        sm: "h-9 rounded-md border border-border px-3 py-2 text-base shadow-xs sm:text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function Input({
  className,
  type,
  size,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>) {
  return (
    <InputPrimitive type={type} data-slot="input" className={cn(inputVariants({ size }), className)} {...props} />
  )
}

export { Input, inputVariants }
