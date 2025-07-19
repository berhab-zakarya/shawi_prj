import Link from "next/link"
import Image from "next/image"
import { GridContainer, GridColumn } from "@/components/layout/grid-container"

const footerSections = [
  {
    title: "أقسام الموقع",
    links: [
      { name: "من نحن", href: "/about" },
      { name: "خدماتنا", href: "/services" },
      { name: "المدونة القانونية", href: "/blog" },
      { name: "الأسئلة الشائعة", href: "/faq" },
    ],
  },
  {
    title: "روابط مهمة",
    links: [
      { name: "المحامي الذكي", href: "/ai-lawyer" },
      { name: "مكتبة القوانين", href: "/law-library" },
      { name: "سياسة الخصوصية", href: "/privacy" },
      { name: "تواصل معنا", href: "/contact" },
    ],
  },
]

const contactInfo = [
  { icon: "📧", text: "info@elshawi-law.ae", href: "mailto:info@elshawi-law.ae" },
  { icon: "📱", text: "+971 50 123 4567", href: "tel:+971501234567" },
  { icon: "📍", text: "دبي، الإمارات العربية المتحدة", href: "#" },
]

export function Footer() {
  return (
    <footer className="relative bg-slate-900 text-slate-100 py-16" dir="rtl">
      <GridContainer>
        {/* Logo and Description */}
        <GridColumn span={{ default: 12, md: 6, lg: 3 }} className="mb-8 lg:mb-0">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="شعار مكتب الشاوي للمحاماة"
                width={48}
                height={48}
                className="brightness-0 invert"
              />
              <span className="text-xl font-bold">مكتب الشاوي للمحاماة</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              خبرة قانونية متكاملة تجمع بين الأصالة والاحترافية لخدمة العدالة
            </p>
          </div>
        </GridColumn>

        {/* Footer Sections */}
        {footerSections.map((section) => (
          <GridColumn key={section.title} span={{ default: 12, md: 6, lg: 3 }} className="mb-8 lg:mb-0">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">{section.title}</h4>
              <nav className="space-y-2">
                {section.links.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block text-slate-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
          </GridColumn>
        ))}

        {/* Contact Information */}
        <GridColumn span={{ default: 12, lg: 3 }}>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">تواصل معنا</h4>
            <div className="space-y-3">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-slate-400">{info.icon}</span>
                  <Link href={info.href} className="text-slate-300 hover:text-white transition-colors duration-200">
                    {info.text}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </GridColumn>

        {/* Copyright */}
        <GridColumn span={{ default: 12 }} className="mt-12 pt-8 border-t border-slate-700">
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} مكتب الشاوي للمحاماة. جميع الحقوق محفوظة.
            </p>
          </div>
        </GridColumn>
      </GridContainer>
    </footer>
  )
}
