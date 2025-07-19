/* eslint-disable */

"use client"

import type React from "react"

import { FileText, Users, Gavel, BookOpen, TrendingUp, Star } from "lucide-react"
import { useState, useEffect } from "react"

// Enhanced Counter Component with smooth easing
type CounterProps = {
  targetValue: number
  format?: (v: number) => React.ReactNode
  duration?: number
  delay?: number
}

function Counter({ targetValue, format, duration = 2000, delay = 0 }: CounterProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentValue = targetValue * easeOutCubic

      setCount(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [targetValue, duration, isVisible])

  return <span>{format ? format(count) : Math.floor(count)}</span>
}

// Enhanced Typing Text Component
type TypingTextProps = {
  text: string
  speed?: number
  delay?: number
}

function TypingText({ text, speed = 80, delay = 0 }: TypingTextProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isStarted, setIsStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => setIsStarted(true), delay)
    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!isStarted) return

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, text, speed, isStarted])

  return (
    <span className="relative">
      {displayText}
      {currentIndex < text.length && <span className="animate-pulse text-current">|</span>}
    </span>
  )
}

// Enhanced BoldCopy Component
type BoldCopyProps = {
  text?: string
  className?: string
  textClassName?: string
  backgroundTextClassName?: string
}

function BoldCopy({ text = "", className = "", textClassName = "", backgroundTextClassName = "" }: BoldCopyProps) {
  if (!text?.length) return null

  return (
    <div
      className={`group relative flex items-center justify-center bg-transparent px-4 py-3 md:px-6 md:py-4 ${className}`}
    >
      <div
        className={`text-4xl uppercase text-amber-400/10 transition-all duration-500 group-hover:opacity-30 group-hover:scale-105 md:text-8xl ${backgroundTextClassName}`}
      >
        {text}
      </div>
      <div
        className={`text-md absolute uppercase text-slate-700 transition-all duration-500 group-hover:text-4xl group-hover:text-amber-600 md:text-3xl group-hover:md:text-8xl ${textClassName}`}
      >
        {text}
      </div>
    </div>
  )
}

// Enhanced BentoCard Component
function BentoCard({ children, className = "", onClick }: any) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 backdrop-blur-sm border border-white/10 ${className}`}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      {children}
    </div>
  )
}

// Enhanced FeatureOne: Customer Satisfaction
function FeatureOne() {
  return (
    <BentoCard className="flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 group">
      <div className="text-amber-700 text-right mb-2 ">رضا العملاء</div>
      <div className="text-4xl  text-slate-600 md:text-7xl flex items-center justify-end gap-2">
        <Counter targetValue={4.9} format={(v) => v.toFixed(1)} duration={2500} />
        <Star className="text-amber-500 size-8 md:size-12 fill-current animate-pulse" />
      </div>
      <div className="mt-2 text-sm text-slate-500 text-right">من أصل 5 نجوم</div>
    </BentoCard>
  )
}

// Enhanced FeatureTwo: Trusted Clients
function FeatureTwo() {
  return (
    <BentoCard className="relative flex flex-col overflow-visible bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 sm:col-span-2 group">
      <strong className="text-2xl text-white text-right mb-4 relative z-10">
        <Counter targetValue={25} format={(v) => `+${Math.ceil(v)}k موكل موثوق`} duration={3000} />
      </strong>
      <div className="mr-4 mt-auto flex justify-end relative z-10">
        <Users className="text-white/90 size-12 group-hover:scale-110 transition-transform duration-300" />
      </div>
    </BentoCard>
  )
}

// Enhanced FeatureThree: Legal Consultation
function FeatureThree() {
  return (
    <BentoCard className="flex flex-col bg-gradient-to-br from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 transition-all duration-300 cursor-pointer group">
      <Gavel className="size-8 md:size-12 mr-auto text-slate-700 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
      <strong className="mt-2 inline-block text-lg text-right text-slate-700 group-hover:text-slate-800 ">
        اطلب استشارة قانونية
      </strong>
      <div className="mt-auto text-right">
        <div className="text-sm text-slate-600/90 mb-1">تواصل مع محامينا الآن</div>
        <div className="text-slate-700 group-hover:underline text-sm">
          <TypingText text="احجز موعد استشارة في خطوات بسيطة" speed={60} delay={500} />
        </div>
      </div>
    </BentoCard>
  )
}

// Enhanced FeatureFour: Professional Contract Drafting
function FeatureFour() {
  return (
    <BentoCard className="flex flex-col gap-4 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 sm:col-span-2 transition-all duration-300 cursor-pointer group">
      <div className="text-2xl text-white text-right ">صياغة العقود باحترافية</div>
      <div className="relative flex-shrink-0 flex justify-end">
        <div className="relative">
          <FileText className="size-16 text-orange-200 group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="text-orange-100 text-sm">خدمات صياغة متخصصة وموثوقة</div>
    </BentoCard>
  )
}

// Enhanced FeatureFive: Legislation
function FeatureFive() {
  return (
    <BentoCard className="flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 sm:col-span-2 group">
      <BoldCopy
        text="تشريعات"
        className="bg-transparent"
        textClassName="text-slate-700 group-hover:text-amber-600"
        backgroundTextClassName="text-amber-400/15"
      />
      <div className="text-sm text-slate-500 mt-2">قاعدة بيانات شاملة للقوانين</div>
    </BentoCard>
  )
}

// Enhanced FeatureSix: Weekly Performance Indicators
function FeatureSix() {
  const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
  const data = [90, 70, 60, 30, 80, 50, 95]
  const [animatedData, setAnimatedData] = useState(data.map(() => 0))

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <BentoCard className="bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 group">
      <div className="flex items-end justify-between h-20 mb-4">
        {animatedData.map((value, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className="bg-amber-700 rounded-xl w-6 transition-all duration-1000 ease-out"
              style={{
                height: `${(value / 100) * 48}px`,
                transitionDelay: `${index * 100}ms`,
              }}
            />
            <span className="text-xs mt-1 text-slate-700 ">{days[index].slice(0, 2)}</span>
          </div>
        ))}
      </div>
      <div className="text-center text-slate-700 flex items-center justify-center gap-2">
        <TrendingUp className="size-4" />
        مؤشرات الأداء الأسبوعية
      </div>
    </BentoCard>
  )
}

// Enhanced FeatureSeven: Legal Categories
function FeatureSeven() {
  const categories = [
    { name: "القانون المدني", rotation: "-rotate-1 md:-rotate-3" },
    { name: "القانون الجنائي", rotation: "rotate-1 md:rotate-3" },
    { name: "القانون التجاري", rotation: "" },
  ]

  return (
    <BentoCard className="flex flex-col gap-3 bg-gradient-to-br from-slate-50 to-slate-100 group">
      {categories.map((category, index) => (
        <div
          key={index}
          className={`w-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-center text-slate-700  transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer ${category.rotation}`}
          style={{ animationDelay: `${index * 200}ms` }}
        >
          {category.name}
        </div>
      ))}
    </BentoCard>
  )
}

// Enhanced FeatureEight: Legal Memo Analysis
function FeatureEight() {
  return (
    <BentoCard className="relative flex flex-col bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 sm:col-span-2 transition-all duration-300 cursor-pointer group">
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <BookOpen className="size-12 text-amber-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      </div>
      <div className="text-right relative z-10">
        <div className="text-xl text-white  mb-2">تحليل مذكرة قانونية</div>
        <p className="text-blue-100 group-hover:underline transition-all duration-300">
          قم برفع المذكرة لتحليل دقيق وسريع باستخدام الذكاء الاصطناعي
        </p>
      </div>
    </BentoCard>
  )
}
// Main Component
export default function Eight() {
  return (
    <div className="storybook-fix w-full max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:grid-rows-3 md:gap-6">
        <FeatureOne />
        <FeatureTwo />
        <FeatureThree />
        <FeatureFour />
        <FeatureFive />
        <FeatureSix />
        <FeatureSeven />
        <FeatureEight />
      </div>
    </div>
  )
}
