"use client"

import type React from "react"
import { Suspense } from "react"
import { useState } from "react"
import { Logo } from "@/components/common/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { copy } from "@/lib/copy"
import { icons } from "@/lib/icons"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: copy.nav.home, href: "/dashboard", icon: icons.home },
  { name: copy.nav.plan, href: "/dashboard/plan", icon: icons.calendar },
  { name: copy.nav.results, href: "/dashboard/resultados", icon: icons.list },
  { name: copy.nav.saved, href: "/dashboard/guardados", icon: icons.bookmark },
  { name: copy.nav.settings, href: "/dashboard/configuracion", icon: icons.settings },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const SearchIcon = icons.search
  const MenuIcon = icons.menu
  const UserIcon = icons.user
  const LogoutIcon = icons.logout

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
          {/* Mobile menu button */}
          <Suspense fallback={<div>Loading...</div>}>
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <MenuIcon className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <MobileSidebar />
              </SheetContent>
            </Sheet>
          </Suspense>

          {/* Logo */}
          <Suspense fallback={<div>Loading...</div>}>
            <Logo className="hidden lg:flex" />
          </Suspense>

          {/* Search bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={copy.placeholders.searchCity}
                className="pl-10 rounded-xl bg-muted/50"
                onKeyDown={(e) => {
                  if (e.key === "/") {
                    e.preventDefault()
                    e.currentTarget.focus()
                  }
                }}
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                /
              </kbd>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Suspense fallback={<div>Loading...</div>}>
              <Link href="/dashboard/plan">
                <Button className="bg-cta hover:bg-cta-hover text-cta-foreground rounded-xl">
                  {copy.buttons.planTrip}
                </Button>
              </Link>
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
              <Link href="/dashboard/guardados">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  {copy.nav.saved}
                </Button>
              </Link>
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
              <Link href="/dashboard/configuracion">
                <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                  <icons.settings className="h-4 w-4" />
                </Button>
              </Link>
            </Suspense>

            {/* User menu */}
            <Suspense fallback={<div>Loading...</div>}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/diverse-user-avatars.png" alt="Usuario" />
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-xl" align="end" forceMount>
                  <DropdownMenuItem className="flex-col items-start">
                    <div className="text-sm font-medium">Usuario Demo</div>
                    <div className="text-xs text-muted-foreground">demo@planesygo.com</div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/configuracion" className="cursor-pointer">
                      <icons.settings className="mr-2 h-4 w-4" />
                      {copy.nav.settings}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-destructive">
                    <LogoutIcon className="mr-2 h-4 w-4" />
                    {copy.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Suspense>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <Suspense fallback={<div>Loading...</div>}>
          <aside className="hidden lg:flex w-64 flex-col border-r bg-sidebar">
            <DesktopSidebar />
          </aside>
        </Suspense>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

function DesktopSidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-2 p-4">
      {navigation.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link key={item.name} href={item.href}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start gap-3 rounded-xl"
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              {item.name}
              {item.name === copy.nav.saved && (
                <Badge variant="secondary" className="ml-auto">
                  3
                </Badge>
              )}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}

function MobileSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Logo />
      </div>
      <nav className="flex flex-col gap-2 p-4 flex-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 rounded-xl"
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                {item.name}
                {item.name === copy.nav.saved && (
                  <Badge variant="secondary" className="ml-auto">
                    3
                  </Badge>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}