"use client"

import React, { useState, Fragment } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NavigationMenu, AppNavigation } from "./navigation-menu"
import { SearchBar } from "./search-bar"
import { Logo } from "./logo"
import { icons } from "@/lib/icons"

interface HeaderProps {
  className?: string
  showSearch?: boolean
  showNavigation?: boolean
  transparent?: boolean
}

export function Header({ className = "", showSearch = true, showNavigation = true, transparent = false }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const SearchIcon = icons.search
  const InfoIcon = icons.info
  const SettingsIcon = icons.settings
  const UserIcon = icons.user
  const ChevronDownIcon = icons.chevronDown

  return (
    <header className={`sticky top-0 z-50 w-full ${transparent ? "bg-transparent" : "bg-background"} ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and navigation */}
          <div className="flex items-center gap-6">
            <Logo />
            {showNavigation && <AppNavigation />}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Search button (mobile) */}
            {showSearch && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-xl"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <SearchIcon className="h-5 w-5" />
                <span className="sr-only">Buscar</span>
              </Button>
            )}

            {/* Search bar (desktop) */}
            {showSearch && (
              <div className="hidden md:block w-64">
                <SearchBar className="w-full" />
              </div>
            )}

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="rounded-xl relative">
              <InfoIcon className="h-5 w-5" />
              <span className="sr-only">Notificaciones</span>
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 rounded-full p-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Usuario" />
                    <AvatarFallback>UD</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">Usuario Demo</p>
                    <p className="text-xs text-muted-foreground">Ver perfil</p>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-muted-foreground hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link href="/app/configuracion" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link href="/app/configuracion" className="flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link href="/app/guardados" className="flex items-center gap-2">
                    <icons.bookmark className="h-4 w-4" />
                    Guardados
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 rounded-lg">
                  <icons.logout className="h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile search bar */}
        {showSearch && isSearchOpen && (
          <div className="pb-4 md:hidden">
            <SearchBar className="w-full" />
          </div>
        )}
      </div>
    </header>
  )
}

// Component for the dashboard header with sidebar
export function DashboardHeader({ className = "", title, description, actions }: {
  className?: string
  title?: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className={`pb-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {actions && (
          <div className="flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

// Component for the page header
export function PageHeader({ className = "", title, description, breadcrumbs, actions }: {
  className?: string
  title: string
  description?: string
  breadcrumbs?: { label: string; href?: string }[]
  actions?: React.ReactNode
}) {
  return (
    <div className={`pb-6 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <Link href="/app" className="hover:text-foreground">
            Inicio
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <Fragment key={index}>
              <icons.chevronRight className="h-4 w-4" />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground">{crumb.label}</span>
              )}
            </Fragment>
          ))}
        </nav>
      )}

      {/* Title and description */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {actions && (
          <div className="flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}