import type React from "react"
import Image from "next/image"
import { GridLayout } from "@/components/ui/Grid"
import { cn } from "@/lib/utils"

interface SectionWithBackgroundProps {
  children: React.ReactNode
  imageSrc?: string
  imageClassName?: string
  gridClassName?: string
  containerClassName?: string
}

export function SectionWithBackground({
  children,
  imageSrc,
  imageClassName,
  gridClassName,
  containerClassName,
}: SectionWithBackgroundProps) {
  return (
    <div className={cn("relative w-full overflow-hidden", containerClassName)}>
      <div className="absolute inset-0 -z-10">
        <GridLayout className={gridClassName} />
        {imageSrc && (
          <Image
            src={imageSrc || "/placeholder.svg"}
            alt="Background Image"
            width={1920}
            height={1080}
            className={cn("absolute inset-0 w-full h-full object-cover opacity-50", imageClassName)}
          />
        )}
      </div>
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </div>
  )
}
