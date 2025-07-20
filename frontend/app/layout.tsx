// app/layout.tsx or app/root-layout.tsx
import "./globals.css"
import type { Metadata } from "next"
import { Noto_Naskh_Arabic, Amiri, Cairo } from "next/font/google"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import { ToastListener } from "@/components/ToastListener"
import { ToastDisplay } from "@/components/Toast-Display"
import ClientLayoutWrapper from "./ClientLayoutWrapper"

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-arabic-primary",
})

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-arabic-secondary",
})

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-arabic-cairo",
})

export const metadata: Metadata = {
  title: "المنصة القانونية",
  description: "منصة قانونية باللغة العربية",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.className} ${notoNaskhArabic.variable} ${amiri.variable}`}
    >
      <body
        style={{
          fontFamily:
            'var(--font-poppin), var(--font-arabic-primary), "Segoe UI Arabic", "Tahoma", "Arial Unicode MS", sans-serif',
          direction: "rtl",
          textAlign: "right",
          lineHeight: "1.6",
          fontFeatureSettings: '"liga" 1, "kern" 1',
        }}
      >
        <ToastProvider>
          <ToastListener />
          <ToastDisplay />

          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>

          <ToastViewport className="fixed top-4 right-4 z-[99999] max-w-sm" />
        </ToastProvider>
      </body>
    </html>
  )
}
