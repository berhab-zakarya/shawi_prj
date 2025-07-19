import type React from "react"
import { Map } from "lucide-react"
import { cn } from "@/lib/utils"

interface ItemProps {
  label: string
  position: string
}

interface HeroCardProps {
  destinations?: ItemProps[]
  treasures?: ItemProps[]
  className?: string
  primaryText?: string
  secondaryText?: string
  thirdText?: string
  conjunctionText?: string
}

const HeroSectionTextHover: React.FC<HeroCardProps> = ({
  className,
  primaryText = "نظام التحليل",
  secondaryText = "الذكي",
  conjunctionText = "و",
  thirdText = "طريقة عمله",
  destinations = [
    {
      label: "⚖️",
      position:
        "-left-20 top-3 group-hover:-rotate-[10deg] group-hover:-translate-y-12 md:-left-28 md:-top-2 sm:-left-24",
    },
    {
      label: "📚",
      position:
        "-left-[72px] top-0 group-hover:-rotate-[20deg] group-hover:-translate-x-10 md:-left-[135px] md:-top-2 sm:-left-24 ",
    },
    {
      label: "👨‍⚖️",
      position:
        "left-[150px] top-0 group-hover:rotate-[10deg] group-hover:-translate-y-10 md:left-[210px] md:-top-1 sm:left-[180px]",
    },
    {
      label: "🏛️",
      position:
        "left-[105px] top-0 group-hover:rotate-[20deg] group-hover:translate-x-16 md:left-[190px] md:-top-2 sm:left-[150px]",
    },
  ],
  treasures = [
    {
      label: "📜",
      position: "-left-[100px] -top-7 -rotate-[30deg] group-hover:-translate-y-8 md:-left-40 md:-top-16 sm:-left-32",
    },
    {
      label: "🔍",
      position: "-left-[115px] -top-2 group-hover:-rotate-45 md:-left-44 md:-top-1 sm:-left-36",
    },
    {
      label: "🧭",
      position: "left-32 -top-12 rotate-[30deg] md:left-[200px] md:-top-[70px] sm:left-[175px] sm:-top-12",
    },
    {
      label: "💼",
      position: "left-32 -top-2 group-hover:rotate-[45deg] md:left-[200px] md:-top-1 sm:left-[160px] ",
    },
  ],
}) => {
  return (
    <div className={cn("storybook-fix relative min-h-[100px] w-full rounded-2xl md:min-h-[200px]", className)}>
      <div className="mb-2 flex flex-col items-center justify-center gap-3">
        <div className="text-normal flex flex-col items-center justify-center p-5 font-bold sm:text-xl md:text-2xl">
          <div className="mt-5">
            <Map size={40} className="fill-zinc-900 text-white" />
          </div>
          <div className="flex items-center justify-center gap-1">
            <span className="text-gray-400">{primaryText}</span>
            <div className="group relative flex items-center">
              <span className="text-zinc-500 group-hover:text-sky-400">{secondaryText}</span>
              <div className="duration-400 absolute inset-0 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100">
                {destinations.map((dest, index) => (
                  <span
                    key={index}
                    className={cn(
                      "pointer-events-none absolute transform text-lg transition-transform duration-500 group-hover:scale-110 sm:text-2xl md:text-4xl",
                      dest.position,
                    )}
                  >
                    {dest.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1">
            <span className="text-gray-400">{conjunctionText}</span>
            <div className="group relative flex items-center">
              <span className="text-zinc-500 group-hover:text-orange-500">{thirdText}</span>
              <div className="duration-400 absolute inset-0 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100">
                {treasures.map((gem, index) => (
                  <span
                    key={index}
                    className={cn(
                      "pointer-events-none absolute transform text-lg transition-transform duration-500 group-hover:scale-110 sm:text-2xl md:text-4xl",
                      gem.position,
                    )}
                  >
                    {gem.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSectionTextHover
