import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[11px] font-bold tracking-[0.12em] uppercase transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]/50 focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#0A0A0A] text-[#F2F0EB] hover:bg-[#5C1A1A]",
        secondary:
          "bg-[#E8E5DF] text-[#0A0A0A] hover:bg-[#D4D0C8]",
        outline:
          "border border-[#C8C4BC] bg-transparent text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#F2F0EB] hover:border-[#0A0A0A]",
        ghost:
          "bg-transparent text-[#4A4845] hover:text-[#0A0A0A] hover:bg-[#E8E5DF]",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        link:
          "text-[#0A0A0A] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-7",
        sm: "h-8 px-4 text-[10px]",
        lg: "h-13 px-9 text-xs",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
