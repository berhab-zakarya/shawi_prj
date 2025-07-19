
import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/contexts/AuthContext"
import { ErrorBoundary } from "@/components/error-boundary"
import Footer from "@/components/landing/sections/Footer"

export const metadata: Metadata = {
  title: "المدونة القانونية - مكتب الشاوي للمحاماة",
  description: "مقالات وموارد قانونية متخصصة، نصائح قانونية، وآخر التطورات في القانون من خبراء مكتب الشاوي للمحاماة",
  keywords: "مدونة قانونية، مقالات قانونية، نصائح قانونية، استشارات قانونية، القانون السعودي، محاماة",
  authors: [{ name: "مكتب الشاوي للمحاماة" }],
  openGraph: {
    title: "المدونة القانونية - مكتب الشاوي للمحاماة",
    description: "مقالات وموارد قانونية متخصصة من خبراء القانون",
    type: "website",
    locale: "ar_SA",
    siteName: "مكتب الشاوي للمحاماة",
  },
  twitter: {
    card: "summary_large_image",
    title: "المدونة القانونية - مكتب الشاوي للمحاماة",
    description: "مقالات وموارد قانونية متخصصة من خبراء القانون",
  },
  alternates: {
    canonical: "/blog",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div lang="ar" dir="rtl">
      <ErrorBoundary>
        <AuthProvider>
          {children}
          <div className="mt-20">
            <Footer/>
          </div>
        </AuthProvider>
      </ErrorBoundary>
    </div>
  )
}