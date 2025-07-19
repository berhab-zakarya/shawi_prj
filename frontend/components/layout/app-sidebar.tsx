/* eslint-disable */

"use client"

import type * as React from "react"
import { BarChart3, Bell, FileText, FolderOpen, Home, PlusCircle, Scale, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useProfile } from "@/hooks/use-profile"
import Logo from "./Logo"

// Navigation items with Arabic text
const navigationItems = [
  {
    title: "لوحة التحكم",
    url: "#dashboard",
    icon: Home,
  },
  {
    title: "قضاياي",
    url: "#cases",
    icon: Scale,
  },
  {
    title: "الإحصائيات",
    url: "#statistics",
    icon: BarChart3,
  },
  {
    title: "المستندات",
    url: "#documents",
    icon: FileText,
  },
  {
    title: "النشاط",
    url: "#activity",
    icon: FolderOpen,
  },
  {
    title: "الإشعارات",
    url: "#notifications",
    icon: Bell,
  },
]

const quickActions = [
  {
    title: "إنشاء قضية جديدة",
    url: "#create-case",
    icon: PlusCircle,
  },
  {
    title: "رفع مستند",
    url: "#upload",
    icon: FileText,
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export function AppSidebar({ activeSection = "dashboard", onSectionChange, ...props }: AppSidebarProps) {
  const { loading, getProfile, user, errorMessage } = useProfile();

  

  // Function to get user's initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.first_name && !user?.last_name) return "م"; // Default Arabic initial
    const firstInitial = user?.first_name?.charAt(0) || "";
    const lastInitial = user?.last_name?.charAt(0) || "";
    return `${firstInitial}${lastInitial}`;
  };

  // Function to get user's full name
  const getUserFullName = () => {
    if (!user?.first_name && !user?.last_name) return "المستخدم";
    return `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
  };

  return (
    <Sidebar variant="inset" className="border-l border-gray-100" side="right" {...props}>
      <SidebarHeader className="border-b border-gray-50 bg-white">
        <div className="flex items-center gap-3 px-6 py-4">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl ">
            <Logo height={40} width={40}/>
          </div>
          <div className="grid flex-1 text-right">
            <span className="text-lg font-semibold text-gray-900">المنصة القانونية</span>
            <span className="text-sm text-gray-500">بوابة العميل</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 text-right">
            التنقل
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeSection === item.url.replace("#", "")}
                    onClick={() => onSectionChange?.(item.url.replace("#", ""))}
                    className="h-11 px-3 rounded-lg hover:bg-gray-50 data-[active=true]:bg-amber-50 data-[active=true]:text-amber-900 data-[active=true]:border-amber-200 data-[active=true]:shadow-sm transition-all duration-200"
                  >
                    <a href={item.url} className="flex items-center gap-3 w-full">
                      <span className="font-medium flex-1 text-right">{item.title}</span>
                      <item.icon className="h-5 w-5" />
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 text-right">
            الإجراءات السريعة
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="h-11 px-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <a href={item.url} className="flex items-center gap-3 w-full">
                      <span className="font-medium text-gray-700 flex-1 text-right">{item.title}</span>
                      <item.icon className="h-5 w-5 text-gray-600" />
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-50 bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="h-14 px-3 hover:bg-gray-50 rounded-lg">
              <a href="#profile" className="flex items-center gap-3">
                <div className="grid flex-1 text-right">
                  {loading ? (
                    <>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </>
                  ) : errorMessage ? (
                    <>
                      <span className="font-semibold text-red-600">خطأ في التحميل</span>
                      <span className="text-sm text-red-500">{errorMessage}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-gray-900">{getUserFullName()}</span>
                      <span className="text-sm text-gray-500">
                        {user?.email
                          ? `${user.email.split("@")[0].slice(0, 20)}@...`
                          : ""}
                      </span>
                    </>
                  )}
                </div>
                <Avatar className="h-9 w-9 rounded-lg border border-gray-200">
                  <AvatarImage 
                    src={user?.avatar || "/placeholder.svg?height=36&width=36"} 
                    alt="المستخدم" 
                  />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <Settings className="mr-auto h-4 w-4 text-gray-400" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}