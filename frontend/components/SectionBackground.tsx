import Image from "next/image"
import GridLayout from "./GridLayout"

const SectionBackground = ({ className = "" }: { className?: string }) => (
  <div className={`fixed inset-0 -z-10 ${className}`}>
    {/* Background SVG */}
    <Image
      src="/bg_hero.svg"
      alt="Background Image"
      width={1920}
      height={1080}
      className="absolute inset-0 w-full h-full object-cover opacity-60"
      priority
    />

    {/* Grid overlay */}
    <GridLayout />

    {/* Additional overlay for better contrast */}
    <div className="absolute inset-0 bg-white/10" />
  </div>
)

export default SectionBackground
