"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Home,
  FileText,
  MessageSquare,
  Receipt,
  Upload,
  Bot,
  Briefcase,
  Mail,
  Users,
  BarChart3,
  ShoppingCart,
  FileCheck,
  BookOpen,
  Brain,
  Store,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  userRole: "Client" | "Lawyer" | "Admin"
}

const navigationConfig = {
  Client: [
    { title: "الرئيسية", url: "/dashboard/client", icon: Home },
    { title: "طلباتي", url: "/dashboard/client/requests", icon: FileText },
    { title: "السوق القانوني", url: "/dashboard/client/marketplace", icon: Store },
    { title: "عقودي", url: "/dashboard/client/contracts", icon: FileCheck },
    { title: "المساعد القانوني الذكي", url: "/dashboard/client/ai", icon: Bot },
    { title: "المستندات المرفوعة", url: "/dashboard/client/documents", icon: Upload },
    { title: "الفواتير", url: "/dashboard/client/invoices", icon: Receipt },
    { title: "المحادثات", url: "/dashboard/client/rooms", icon: MessageSquare },
  ],
  Lawyer: [
    { title: "الرئيسية", url: "/dashboard/lawyer", icon: Home },
    { title: "خدماتي", url: "/dashboard/lawyer/services", icon: Briefcase },
    { title: "الطلبات المسندة", url: "/dashboard/lawyer/requests", icon: Mail },
    { title: "مراجعة العقود", url: "/dashboard/lawyer/contracts", icon: FileCheck },
    { title: "المحادثات", url: "/dashboard/lawyer/rooms", icon: MessageSquare },
    { title: "الفواتير", url: "/dashboard/lawyer/invoices", icon: Receipt },
  ],
  Admin: [
    { title: "لوحة الإدارة", url: "/dashboard/admin", icon: Home },
    { title: "إدارة المستخدمين", url: "/dashboard/admin/users", icon: Users },
    { title: "لوحة التحليلات", url: "/dashboard/admin/analytics", icon: BarChart3 },
    { title: "مراقبة السوق", url: "/dashboard/admin/marketplace", icon: ShoppingCart },
    { title: "الإشراف على العقود", url: "/dashboard/admin/contracts", icon: FileCheck },
    // { title: "المكتبة القانونية", url: "/dashboard/admin/library", icon: BookOpen },
    { title: "المدونة", url: "/dashboard/admin/blog", icon: Brain },
  ],
}

const roleLabels = {
  Client: "لوحة العميل",
  Lawyer: "لوحة المحامي",
  Admin: "لوحة الإدارة",
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const pathname = usePathname()
  const navigation = navigationConfig[userRole]

  return (
    <Sidebar side="right" collapsible="none" className="border-l bg-[#faf8f4]">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">النظام القانوني</span>
            <span className="text-xs text-muted-foreground">{roleLabels[userRole]}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>التنقل</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
