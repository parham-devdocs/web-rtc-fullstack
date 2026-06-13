import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles - larger, better proportions
        "flex h-8 w-full rounded-md border border-input bg-background px-3 py-2",
        "text-sm ring-offset-background",
        // File input handling
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // Placeholder
        "placeholder:text-muted-foreground",
        // Focus states - smooth ring effect
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Error/aria states
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "dark:aria-invalid:ring-destructive/40",
        // Transitions
        "transition-all duration-200",
        className
      )}
      {...props}
    />
  )
}

export { Input }