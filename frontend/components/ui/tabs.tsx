import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "lib/utils"

type TabsVariant = "underline" | "pills"

const TabsVariantContext = React.createContext<TabsVariant>("underline")

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn(className)} {...props} />
}

const tabsListVariants = cva("flex", {
  variants: {
    variant: {
      underline: "gap-4",
      pills: "gap-1",
    },
  },
  defaultVariants: {
    variant: "underline",
  },
})

function TabsList({
  className,
  variant = "underline",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsVariantContext.Provider value={variant ?? "underline"}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
    </TabsVariantContext.Provider>
  )
}

const tabsTriggerVariants = cva(
  "inline-flex items-center whitespace-nowrap text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        underline:
          "gap-2 border-b-2 border-transparent py-3 text-foreground hover:border-muted-foreground data-[active]:border-primary",
        pills:
          "gap-3 rounded px-4 py-2 text-left hover:bg-muted data-[active]:bg-primary/10 data-[active]:text-primary-hover",
      },
    },
    defaultVariants: {
      variant: "underline",
    },
  }
)

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  const variant = React.useContext(TabsVariantContext)
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
