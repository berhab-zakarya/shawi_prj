// app/ClientLayoutWrapper.tsx
"use client"
import Footer from "@/components/layout/footer"

import { usePathname } from "next/navigation"
import Header from "@/components/layout/Header"

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Hide header/footer on these routes
  const hideLayout =
    pathname === "/auth" || pathname === "/login" || pathname.startsWith("/dashboard")

  return (
    <>
      {!hideLayout && <Header />}
      <main className={!hideLayout ? "pt-20" : ""}>{children}</main>
      {!hideLayout && <Footer />}
    </>
  )
}
