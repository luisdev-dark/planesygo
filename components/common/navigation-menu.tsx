"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { icons } from "@/lib/icons"
import { Logo } from "./logo"

interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
  disabled?: boolean
}

interface NavigationMenuProps {
  items: NavItem[]
  className?: string
  mobileOnly?: boolean
}

export function NavigationMenu({ items, className = "", mobileOnly = false }: NavigationMenuProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Function to determine if a nav item is active
  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app" || pathname.startsWith("/app/")
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const MenuIcon = icons.menu
  const XIcon = icons.close

  // Mobile navigation menu
  const MobileNav = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden rounded-xl">
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 sm:w-80 rounded-r-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span>ViajeSmart</span>
          </SheetTitle>
          <SheetDescription>
            Navega por las diferentes secciones de la aplicación
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.disabled ? "#" : item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  active 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                aria-disabled={item.disabled}
              >
                {Icon && <Icon className="h-5 w-5" />}
                <span className="font-medium">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto rounded-full">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </div>
        <div className="mt-auto pt-6 border-t">
          <div className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <icons.user className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Usuario Demo</p>
              <p className="text-sm text-muted-foreground">demo@viajesmart.com</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start rounded-xl p-3" asChild>
            <Link href="/app/configuracion">
              <icons.settings className="mr-3 h-5 w-5" />
              Configuración
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start rounded-xl p-3" asChild>
            <Link href="/login">
              <icons.logout className="mr-3 h-5 w-5" />
              Cerrar sesión
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )

  // Desktop navigation menu
  const DesktopNav = () => (
    <nav className={`hidden md:flex items-center space-x-1 ${className}`}>
      {items.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href)
        
        return (
          <Link
            key={item.href}
            href={item.disabled ? "#" : item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
              active 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted"
            } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-disabled={item.disabled}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span className="text-sm font-medium">{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="rounded-full text-xs">
                {item.badge}
              </Badge>
            )}
          </Link>
        )
      })}
    </nav>
  )

  if (mobileOnly) {
    return <MobileNav />
  }

  return (
    <>
      <MobileNav />
      <DesktopNav />
    </>
  )
}

// Predefined navigation menus for different layouts
export function AppNavigation({ className = "" }: { className?: string }) {
  const navItems: NavItem[] = [
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

  return <NavigationMenu items={navItems} className={className} />
}

export function DashboardNavigation({ className = "" }: { className?: string }) {
  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/app",
      icon: icons.home,
    },
    {
      title: "Planificar Viaje",
      href: "/app/plan",
      icon: icons.plus,
    },
    {
      title: "Ver Resultados",
      href: "/app/resultados",
      icon: icons.map,
      disabled: true,
      badge: "Próximamente",
    },
    {
      title: "Mis Guardados",
      href: "/app/guardados",
      icon: icons.bookmark,
    },
  ]

  return <NavigationMenu items={navItems} className={className} />
}

// Sidebar navigation component
export function SidebarNavigation({ className = "" }: { className?: string }) {
  const navItems: NavItem[] = [
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

  const pathname = usePathname()

  // Function to determine if a nav item is active
  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app" || pathname.startsWith("/app/")
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {navItems.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href)
        
        return (
          <Link
            key={item.href}
            href={item.disabled ? "#" : item.href}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              active 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted"
            } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-disabled={item.disabled}
          >
            {Icon && (
              <div className="w-5 h-5 flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <span className="font-medium">{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto rounded-full">
                {item.badge}
              </Badge>
            )}
          </Link>
        )
      })}
    </div>
  )
}