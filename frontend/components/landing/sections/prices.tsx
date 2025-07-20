"use client"
import HeroSectionTextHover from "@/components/animata/hero/hero-section-text-hover"
import { Check } from "lucide-react"
import Link from "next/link"

const tiers = [
  {
    name: "تحليل مذكرة",
    id: "tier-memo-analysis",
    href: "/auth",
    price: "99 درهم",
    description: "تحليل فوري ومفصل للمستندات القانونية",
    features: ["تحليل فوري للمستند", "استخراج الوقائع والطلبات", "تقرير PDF قابل للتنزيل", "دعم فني على مدار الساعة"],
    featured: false,
  },
  {
    name: "الخطة الذهبية",
    id: "tier-gold",
    href: "/auth",
    price: "499 درهم",
    period: "/شهرياً",
    description: "الحل الأمثل للمحامين والمكاتب القانونية",
    features: [
      "10 تحليلات للمذكرات شهرياً",
      "أولوية في الدعم البشري",
      "خصم 20% على الاستشارات الخاصة",
      "تقارير مفصلة ومخصصة",
      "دعم مخصص على مدار الساعة",
      "تكامل مع الأنظمة القانونية",
    ],
    featured: true,
  },
  {
    name: "استشارة خاصة",
    id: "tier-consultation",
    href: "/auth",
    price: "249 درهم",
    description: "جلسة استشارية مخصصة مع خبير قانوني",
    features: ["جلسة 30 دقيقة مع محامٍ", "سرية تامة ومضمونة", "خطة عمل مبدئية للقضية", "متابعة لمدة أسبوع"],
    featured: false,
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

export default function Pricing() {
  return (
    <div className="relative isolate bg-white px-6 lg:px-8 py-8 md:py-16 lg:py-32" dir="rtl">
      <div aria-hidden="true" className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl">
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#D4AF37] to-[#F4E4BC] opacity-30"
        />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <HeroSectionTextHover
          primaryText="إختر خطتك"
          secondaryText="أسعار مناسبة"
          thirdText="حلل أو إستشر"
          conjunctionText=""
        />
      </div>

      <div className="mx-auto mt-12 grid max-w-lg grid-cols-1 items-stretch gap-y-6 sm:mt-16 sm:gap-y-0 lg:max-w-6xl lg:grid-cols-3 lg:gap-x-8">
        {tiers.map((tier, tierIdx) => (
          <div
            key={tier.id}
            className={classNames(
              tier.featured ? "relative shadow-2xl ring-2" : "bg-white/60 ring-1 ring-gray-900/10",
              tier.featured ? "ring-[#D4AF37] bg-gradient-to-b from-[#D4AF37]/5 to-[#D4AF37]/10" : "",
              "rounded-3xl p-8 sm:p-10 flex flex-col",
            )}
            style={
              tier.featured
                ? {
                    background: "linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(184, 148, 31, 0.05) 100%)",
                    borderColor: "#D4AF37",
                  }
                : {}
            }
          >
            {tier.featured && (
              <div className="absolute -top-4 right-1/2 translate-x-1/2">
                <div
                  className="rounded-full px-4 py-1 text-sm font-semibold text-white shadow-lg"
                  style={{ backgroundColor: "#D4AF37" }}
                >
                  الأكثر شعبية
                </div>
              </div>
            )}

            <h3
              id={tier.id}
              className={classNames(
                tier.featured ? "text-[#D4AF37]" : "text-[#D4AF37]",
                "text-base/7 font-semibold text-right",
              )}
            >
              {tier.name}
            </h3>

            <p className="mt-4 flex items-baseline gap-x-2 justify-end">
              <span className="text-base text-gray-500">{tier.period || ""}</span>
              <span
                className={classNames(
                  tier.featured ? "text-gray-900" : "text-gray-900",
                  "text-4xl font-semibold tracking-tight sm:text-5xl",
                )}
              >
                {tier.price}
              </span>
            </p>

            <p className={classNames(tier.featured ? "text-gray-700" : "text-gray-600", "mt-6 text-base/7 text-right")}>
              {tier.description}
            </p>

            <ul
              role="list"
              className={classNames(
                tier.featured ? "text-gray-700" : "text-gray-600",
                "mt-8 space-y-3 text-sm/6 sm:mt-10 flex-1",
              )}
            >
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-x-3 items-start text-right">
                  <Check
                    aria-hidden="true"
                    className={classNames(
                      tier.featured ? "text-[#D4AF37]" : "text-[#D4AF37]",
                      "h-6 w-5 flex-none mt-0.5",
                    )}
                  />
                  <span className="flex-1">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={tier.href}
              aria-describedby={tier.id}
              className={classNames(
                tier.featured
                  ? "text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  : "text-[#D4AF37] ring-2 ring-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all duration-200",
                "mt-8 block rounded-xl px-4 py-3 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10",
              )}
              style={
                tier.featured
                  ? {
                      backgroundColor: "#D4AF37",
                      borderColor: "#D4AF37",
                    }
                  : {}
              }
            >
              ابدأ الآن
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
