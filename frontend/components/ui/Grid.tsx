import { cn } from "@/lib/utils"

export function GridLayout({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {/* Main grid pattern - optimized for performance */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(226 232 240 / 0.6) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(226 232 240 / 0.6) 1px, transparent 1px)
          `,
          backgroundSize: "4rem 4rem",
          willChange: "transform",
        }}
      />

      {/* Smaller grid overlay */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(203 213 225 / 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(203 213 225 / 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "1rem 1rem",
          willChange: "transform",
        }}
      />

      {/* Radial gradient for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/10" />
    </div>
  )
}
