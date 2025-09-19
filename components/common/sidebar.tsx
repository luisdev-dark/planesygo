"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Logo } from "./logo"
import { SidebarNavigation } from "./navigation-menu"
import { icons } from "@/lib/icons"

interface SidebarProps {
  className?: string
  collapsible?: boolean
}

export function Sidebar({ className = "", collapsible = true }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const ChevronLeftIcon = icons.chevronLeft
  const ChevronRightIcon = icons.chevronRight
  const HomeIcon = icons.home
  const PlusIcon = icons.plus
  const MapIcon = icons.map
  const BookmarkIcon = icons.bookmark
  const SettingsIcon = icons.settings
  const UserIcon = icons.user
  const LogOutIcon = icons.logout

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/app",
      icon: HomeIcon,
    },
    {
      title: "Planificar",
      href: "/app/plan",
      icon: PlusIcon,
    },
    {
      title: "Resultados",
      href: "/app/resultados",
      icon: MapIcon,
    },
    {
      title: "Guardados",
      href: "/app/guardados",
      icon: BookmarkIcon,
    },
    {
      title: "Configuración",
      href: "/app/configuracion",
      icon: SettingsIcon,
    },
  ]

  // Function to determine if a nav item is active
  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app" || pathname.startsWith("/app/")
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className={`flex flex-col h-full bg-background border-r ${className}`}>
      {/* Logo and collapse button */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Logo size="md" showText={!isCollapsed} />
        </div>
        {collapsible && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 rounded-xl"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
            </span>
          </Button>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                active 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span className="font-medium">{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* User profile */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Usuario" />
              <AvatarFallback>UD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">Usuario Demo</p>
              <p className="text-sm text-muted-foreground truncate">demo@viajesmart.com</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Button variant="ghost" className="justify-start rounded-xl p-3" asChild>
              <Link href="/app/configuracion" className="flex items-center gap-3">
                <UserIcon className="h-5 w-5" />
                Perfil
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start rounded-xl p-3" asChild>
              <Link href="/login" className="flex items-center gap-3">
                <LogOutIcon className="h-5 w-5" />
                Cerrar sesión
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Component for a collapsed sidebar
export function CollapsedSidebar({ className = "" }: { className?: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/app",
      icon: icons.home,
    },
    {
      title: "Planificar",
      href: "/app/plan",
      icon: icons.plus,
    },
    {
      title: "Resultados",
      href: "/app/resultados",
      icon: icons.map,
    },
    {
      title: "Guardados",
      href: "/app/guardados",
      icon: icons.bookmark,
    },
    {
      title: "Configuración",
      href: "/app/configuracion",
      icon: icons.settings,
    },
  ]

  // Function to determine if a nav item is active
  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app" || pathname.startsWith("/app/")
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className={`flex flex-col h-full bg-background border-r ${className}`}>
      {/* Logo */}
      <div className="flex items-center justify-center p-4">
        <Logo size="md" showText={false} />
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navigationItems.map((item) => {
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center p-3 rounded-xl transition-colors ${
                active 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
              title={item.title}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* User profile */}
      <div className="p-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-12 rounded-xl"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-avatar.jpg" alt="Usuario" />
            <AvatarFallback>UD</AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </div>
  )
}

// Component for a mobile bottom navigation
export function MobileBottomNav({ className = "" }: { className?: string }) {
  const pathname = usePathname()

  const navigationItems = [
    {
      title: "Inicio",
      href: "/app",
      icon: icons.home,
    },
    {
      title: "Planificar",
      href: "/app/plan",
      icon: icons.plus,
    },
    {
      title: "Resultados",
      href: "/app/resultados",
      icon: icons.map,
    },
    {
      title: "Guardados",
      href: "/app/guardados",
      icon: icons.bookmark,
    },
  ]

  // Function to determine if a nav item is active
  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app" || pathname.startsWith("/app/")
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden ${className}`}>
      <div className="flex items-center justify-around h-16">
        {navigationItems.map((item) => {
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                active 
                  ? "text-primary" 
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}