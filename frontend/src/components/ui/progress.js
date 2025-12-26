"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef(({ className, value, indicatorClassName, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={cn("relative h-4 w-full overflow-hidden rounded-full", className)}
      {...props}
    >
      <div
        className={cn("h-full w-full flex-1 transition-all", indicatorClassName || "bg-primary")}
        style={{ width: `${value}%` }}
      />
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }
