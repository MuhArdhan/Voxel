import * as React from "react"

import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-[#D4D0C8]", className)}
      {...props}
    />
  )
}

// --- Preset Skeletons ---

function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="w-full aspect-[4/5] rounded-2xl" />
      <div className="space-y-2 px-1">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-4 w-3/4 rounded-full" />
        <Skeleton className="h-3 w-16 rounded-full" />
      </div>
    </div>
  )
}

function OrderCardSkeleton() {
  return (
    <div className="p-5 border border-[#C8C4BC] rounded-2xl space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-48 rounded-full" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
    </div>
  )
}

export { Skeleton, ProductCardSkeleton, OrderCardSkeleton }
