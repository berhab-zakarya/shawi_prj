"use client"
import Image from "next/image"
import { GridLayout } from "@/components/ui/Grid"
import Header from "@/components/layout/Header"
import { AIRag } from "@/components/landing/sections/AIRag"
import HeroSection from "@/components/landing/sections/HeroSection"
import ArabicBlog from "@/components/landing/sections/blog"
import Pricing from "@/components/landing/sections/Pricing"
import FaqSection from "@/components/landing/sections/Faq"
import { faqSectionData } from "@/lib/constants"
import { OurServices } from "@/components/landing/sections/OurServices"
import { LibrarySection } from "@/components/landing/sections/Library"
import ContactSection from "@/components/landing/sections/Contact"
import Footer from "@/components/landing/sections/Footer"
import { SectionWithBackground } from "@/components/layout/section-with-background"

export default function Home() {
 
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fixed Global Background Layer - Lowest z-index */}
      <div className="fixed inset-0 z-0">
        <GridLayout  />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white/60" />
      </div>

      {/* Main Content Container - Proper layering */}
      <div className="relative z-10">
        {/* Header - Fixed with high z-index */}
        <div className="relative z-50">
          <Header />
        </div>

        {/* Main Content Grid */}
        <main className="relative z-20">
          {/* Hero Section - Full viewport with optimized background */}
          <section id="#about" className="relative min-h-screen flex items-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <Image src="/bg_hero.svg" alt="" fill className="object-cover opacity-60" priority quality={85} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/30" />
            </div>
            <div className="relative z-10 w-full">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-12 gap-4 lg:gap-6">
                  <div className="col-span-12">
                    <HeroSection />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AI Rag Section */}
          <section id="#lawyer-ai" className="relative">
            <SectionWithBackground
              imageSrc="/bg_hero.svg"
              imageClassName="opacity-20 object-cover"
              containerClassName="relative z-10"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-12 gap-4 lg:gap-6">
                  <div className="col-span-12">
                    <AIRag />
                  </div>
                </div>
              </div>
            </SectionWithBackground>
          </section>

          {/* Library Section */}
          <section id="#library" className="relative bg-slate-50/30">
            <SectionWithBackground
              imageSrc="/bg_hero.svg"
              imageClassName="opacity-15 object-cover"
              containerClassName="relative z-10"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-12 gap-4 lg:gap-6">
                  <div className="col-span-12">
                    <LibrarySection />
                  </div>
                </div>
              </div>
            </SectionWithBackground>
          </section>

          {/* Services Section */}
          <section id="#services" className="relative">
            <SectionWithBackground
              imageSrc="/bg_hero.svg"
              imageClassName="opacity-25 object-cover"
              containerClassName="relative z-10"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-12 gap-4 lg:gap-6">
                  <div className="col-span-12">
                    <OurServices />
                  </div>
                </div>
              </div>
            </SectionWithBackground>
          </section>

          {/* Blog Section */}
          <section id="#blog" className="relative  bg-slate-50/30">
            <SectionWithBackground
              imageSrc="/bg_hero.svg"
              imageClassName="opacity-20 object-cover"
              containerClassName="relative z-10"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-12 gap-4 lg:gap-6">
                  <div className="col-span-12">
                    <ArabicBlog />
                  </div>
                </div>
              </div>
            </SectionWithBackground>
          </section>

          {/* Pricing Section */}
          <section id="#pricing" className="relative">
            <SectionWithBackground
              imageSrc="/bg_hero.svg"
              imageClassName="opacity-15 object-cover"
              containerClassName="relative z-10"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-12 gap-4 lg:gap-6">
                  <div className="col-span-12">
                    <Pricing />
                  </div>
                </div>
              </div>
            </SectionWithBackground>
          </section>

          {/* FAQ and Contact Section */}
          <section className="relative bg-slate-50/30">
            <div className="absolute inset-0 z-0">
              <Image src="/bg_section_hero.svg" alt="" fill className="object-cover opacity-30" quality={85} />
              <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-12 gap-4 lg:gap-6">
                <div className="col-span-12">
                  <div className="space-y-16 md:space-y-24">
                    <FaqSection data={faqSectionData} />
                    <ContactSection />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <div className="relative z-20">
          <Footer />
        </div>
      </div>
    </div>
  )
}
