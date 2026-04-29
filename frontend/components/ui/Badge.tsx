import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/types"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-bold tracking-[0.15em] uppercase rounded-sm border transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#0A0A0A] text-[#F2F0EB] border-transparent",
        secondary: "bg-[#E8E5DF] text-[#4A4845] border-transparent",
        limited: "bg-[#0A0A0A] text-[#C8FF00] border-transparent",
        sale: "bg-[#5C1A1A] text-white border-transparent",
        outline: "bg-transparent text-[#0A0A0A] border-[#C8C4BC]",
        // Order status variants
        pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
        paid: "bg-blue-50 text-blue-700 border-blue-200",
        processing: "bg-purple-50 text-purple-700 border-purple-200",
        shipped: "bg-cyan-50 text-cyan-700 border-cyan-200",
        completed: "bg-green-50 text-green-700 border-green-200",
        cancelled: "bg-red-50 text-red-600 border-red-200",
        admin: "bg-[#0A0A0A] text-[#C8FF00] border-transparent",
        user: "bg-[#E8E5DF] text-[#4A4845] border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

const DOT_COLORS: Partial<Record<string, string>> = {
  limited: "bg-[#C8FF00] animate-pulse",
  pending: "bg-yellow-400",
  paid: "bg-blue-400",
  processing: "bg-purple-400",
  shipped: "bg-cyan-400",
  completed: "bg-green-400",
  cancelled: "bg-red-400",
}

function Badge({ className, variant = "default", dot, children, ...props }: BadgeProps) {
  const dotColor = variant ? DOT_COLORS[variant] : undefined

  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {dot && dotColor && (
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotColor)} />
      )}
      {children}
    </span>
  )
}

// Helper to get badge variant from order status
function getStatusBadgeVariant(status: OrderStatus): VariantProps<typeof badgeVariants>["variant"] {
  return status as VariantProps<typeof badgeVariants>["variant"]
}

export { Badge, badgeVariants, getStatusBadgeVariant }
