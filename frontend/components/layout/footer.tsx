"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUp, Mail, Phone, MapPin, Linkedin, Instagram } from "lucide-react"

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("footer-section")
    if (element) observer.observe(element)

    // Scroll to top button visibility
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const footerSections = [
    {
      title: "أقسام الموقع",
      links: [
        { name: "من نحن", href: "#about" },
        { name: "خدماتنا", href: "#services" },
        { name: "المدونة القانونية", href: "#blog" },
        { name: "الأسئلة الشائعة", href: "#faq" },
      ],
    },
    {
      title: "روابط مهمة",
      links: [
        { name: "المحامي الذكي", href: "#lawyer-ai" },
        { name: "مكتبة القوانين", href: "#library" },
        { name: "سياسة الخصوصية", href: "/privacy" },
        { name: "شروط الاستخدام", href: "/terms" },
      ],
    },
    {
      title: "الخدمات والأسعار",
      links: [
        { name: "قانون الشركات", href: "#services" },
        { name: "القانون العقاري", href: "#services" },
        { name: "القانون الجنائي", href: "#services" },
        { name: "أسعارنا", href: "#pricing" },
      ],
    },
  ]

  const socialLinks = [
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://linkedin.com/company/elshawi-law",
      color: "hover:text-blue-700",
    },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/elshawi_law", color: "hover:text-pink-600" },
  ]

  return (
    <>
      <footer id="footer-section" className="relative bg-slate-900 text-slate-100 py-16 overflow-hidden" dir="rtl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div
              className={`lg:col-span-1 transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Image
                      src="/placeholder.svg?height=56&width=56&text=Logo"
                      alt="شعار مكتب الشاوي للمحاماة"
                      width={56}
                      height={56}
                      className="brightness-0 invert"
                    />
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#D4AF37]/20 to-[#B8941F]/20 rounded-full blur-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">مكتب الشاوي للمحاماة</h3>
                    <p className="text-slate-400 text-sm">خبرة قانونية موثوقة</p>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  خبرة قانونية متكاملة تجمع بين الأصالة والاحترافية لخدمة العدالة مع أحدث تقنيات الذكاء الاصطناعي
                </p>

                {/* Social Links */}
                <div className="flex items-center gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 transition-all duration-300 hover:bg-slate-700 transform hover:scale-110 ${social.color}`}
                      aria-label={social.name}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Sections */}
            {footerSections.map((section, index) => (
              <div
                key={section.title}
                className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${(index + 1) * 200}ms` }}
              >
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-white relative">
                    {section.title}
                    <div className="absolute -bottom-2 right-0 w-12 h-0.5 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] rounded-full" />
                  </h4>
                  <nav className="space-y-3">
                    {section.links.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="block text-slate-300 hover:text-white transition-all duration-200 hover:translate-x-1 group"
                      >
                        <span className="relative">
                          {link.name}
                          <span className="absolute -bottom-0.5 right-0 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
                        </span>
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Info Bar */}
          <div
            className={`mt-16 pt-8 border-t border-slate-700 transition-all duration-700 ease-out delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">البريد الإلكتروني</p>
                  <a
                    href="mailto:info@elshawi-law.ae"
                    className="text-slate-200 hover:text-white transition-colors duration-200"
                  >
                    info@elshawi-law.ae
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">الهاتف</p>
                  <a
                    href="tel:+971501234567"
                    className="text-slate-200 hover:text-white transition-colors duration-200"
                  >
                    +971 50 123 4567
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">الموقع</p>
                  <span className="text-slate-200">دبي، الإمارات العربية المتحدة</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div
            className={`mt-12 pt-8 border-t border-slate-700 text-center transition-all duration-700 ease-out delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-sm">
                © {new Date().getFullYear()} مكتب الشاوي للمحاماة. جميع الحقوق محفوظة.
              </p>
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <Link href="/privacy" className="hover:text-white transition-colors duration-200">
                  سياسة الخصوصية
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors duration-200">
                  شروط الاستخدام
                </Link>
                <Link href="/cookies" className="hover:text-white transition-colors duration-200">
                  سياسة الكوكيز
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 w-12 h-12 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center"
          aria-label="العودة إلى الأعلى"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  )
}
