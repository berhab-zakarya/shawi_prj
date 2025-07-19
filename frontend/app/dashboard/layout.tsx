import type React from "react"
import { redirect } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/dashboard/Header"
import { jwtVerify } from 'jose';
import { UserRole } from "@/types"
import { cookies } from 'next/headers'
import { WebSocketProvider } from "@/components/websocket-provider"
import "./newglobals.css";

async function getUserRole(): Promise<"Client" | "Lawyer" | "Admin" | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    console.log("✅ Server Token:", token)

    if (!token) {
        redirect('/auth')
    }

    const secret = new TextEncoder().encode('django-insecure-$_q)*y(1q3=%oq9&$uzlp%7awjpki-puni*xnmil(ad#5@et+g') // secret الحقيقي

    try {
        const { payload } = await jwtVerify(token, secret)
        const role = payload.role as UserRole
        return role || "Client"
    } catch (error: any) {
        if (error.code === "ERR_JWT_EXPIRED") {
            console.error("❌ Token expired:", error)
            redirect('/auth') // أو '/login'
        } else {
            console.error("❌ JWT error:", error)
            redirect('/auth')
        }
    }

    return null
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const userRole = await getUserRole()

    if (!userRole) {
        redirect("/auth")
    }

    return (

        <WebSocketProvider>
            <div className="min-h-screen bg-background" dir="rtl">
            <SidebarProvider>
                <div className="flex min-h-screen w-full bg-[#faf8f4]">
                    <AppSidebar userRole={userRole} />
                    <div className="flex flex-1 flex-col min-w-0">
                        <Header />
                        <main className="flex-1 p-6">{children}                    </main>
                    </div>
                </div>
            </SidebarProvider>
        </div>
    </WebSocketProvider >
    
    )
}
