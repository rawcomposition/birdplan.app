import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-[50px] w-full min-w-0 rounded-[13px] border-[1.5px] border-gray-200 bg-white px-4 text-[15px] font-medium text-gray-800 transition-colors outline-none placeholder:text-gray-400 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
