import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface GridContainerProps {
  children: ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

export function GridContainer({ children, className, size = "xl" }: GridContainerProps) {
  const sizeClasses = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  }

  return (
    <div className={cn("mx-auto px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}>
      <div className="grid grid-cols-12 gap-4 lg:gap-6">{children}</div>
    </div>
  )
}

interface GridColumnProps {
  children: ReactNode
  className?: string
  span?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  start?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

export function GridColumn({ children, className, span = { default: 12 }, start }: GridColumnProps) {
  const getSpanClass = () => {
    const classes = []

    if (span.default) classes.push(`col-span-${span.default}`)
    if (span.sm) classes.push(`sm:col-span-${span.sm}`)
    if (span.md) classes.push(`md:col-span-${span.md}`)
    if (span.lg) classes.push(`lg:col-span-${span.lg}`)
    if (span.xl) classes.push(`xl:col-span-${span.xl}`)

    return classes.join(" ")
  }

  const getStartClass = () => {
    if (!start) return ""

    const classes = []

    if (start.default) classes.push(`col-start-${start.default}`)
    if (start.sm) classes.push(`sm:col-start-${start.sm}`)
    if (start.md) classes.push(`md:col-start-${start.md}`)
    if (start.lg) classes.push(`lg:col-start-${start.lg}`)
    if (start.xl) classes.push(`xl:col-start-${start.xl}`)

    return classes.join(" ")
  }

  return <div className={cn(getSpanClass(), getStartClass(), className)}>{children}</div>
}
