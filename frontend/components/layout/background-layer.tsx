"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function BackgroundLayer() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-0">
      {/* Primary Background Image */}
      <div className="absolute inset-0">
        <Image src="/bg_hero.svg" alt="" fill className="object-cover opacity-30" priority quality={85} />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-40">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(226 232 240 / 0.5) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(226 232 240 / 0.5) 1px, transparent 1px)
            `,
            backgroundSize: "4rem 4rem",
          }}
        />
      </div>

      {/* Gradient Overlays for Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  )
}
