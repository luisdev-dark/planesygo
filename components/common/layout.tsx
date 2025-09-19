"use client"

import { ReactNode } from "react"
import { Header } from "./header"
import { Footer } from "./footer"
import { MobileBottomNav } from "./sidebar"

interface LayoutProps {
  children: ReactNode
  className?: string
  header?: boolean
  footer?: boolean
  mobileNav?: boolean
  headerProps?: Parameters<typeof Header>[0]
  footerProps?: Parameters<typeof Footer>[0]
}

export function Layout({
  children,
  className = "",
  header = true,
  footer = true,
  mobileNav = true,
  headerProps = {},
  footerProps = {},
}: LayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {header && <Header {...headerProps} />}
      <main className="flex-1">{children}</main>
      {footer && <Footer {...footerProps} />}
      {mobileNav && <MobileBottomNav />}
    </div>
  )
}

// Component for a dashboard layout with sidebar
interface DashboardLayoutProps {
  children: ReactNode
  className?: string
  sidebar?: boolean
  collapsible?: boolean
  header?: boolean
  footer?: boolean
  headerProps?: Parameters<typeof Header>[0]
  footerProps?: Parameters<typeof Footer>[0]
}

export function DashboardLayout({
  children,
  className = "",
  sidebar = true,
  collapsible = true,
  header = true,
  footer = false,
  headerProps = {},
  footerProps = {},
}: DashboardLayoutProps) {
  return (
    <div className={`min-h-screen flex ${className}`}>
      {sidebar && (
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-0 h-screen">
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-white"
                      >
                        <path d="M3 12h2l2-6l2 6h2" />
                        <path d="M13 12h2l2-6l2 6h2" />
                        <path d="M6 20h12" />
                      </svg>
                    </div>
                    <span className="font-bold text-lg">ViajeSmart</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        {header && <Header {...headerProps} />}
        <main className="flex-1 overflow-y-auto">{children}</main>
        {footer && <Footer {...footerProps} />}
      </div>
    </div>
  )
}

// Component for a centered layout (for login, register, etc.)
interface CenteredLayoutProps {
  children: ReactNode
  className?: string
  header?: boolean
  footer?: boolean
  headerProps?: Parameters<typeof Header>[0]
  footerProps?: Parameters<typeof Footer>[0]
}

export function CenteredLayout({
  children,
  className = "",
  header = true,
  footer = true,
  headerProps = {},
  footerProps = {},
}: CenteredLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {header && <Header {...headerProps} />}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
      {footer && <Footer {...footerProps} />}
    </div>
  )
}

// Component for a minimal layout (for pages like login, register, etc.)
interface MinimalLayoutProps {
  children: ReactNode
  className?: string
  header?: boolean
  footer?: boolean
  headerProps?: Parameters<typeof Header>[0]
  footerProps?: Parameters<typeof Footer>[0]
}

export function MinimalLayout({
  children,
  className = "",
  header = false,
  footer = false,
  headerProps = {},
  footerProps = {},
}: MinimalLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {header && <Header {...headerProps} />}
      <main className="flex-1">{children}</main>
      {footer && <Footer {...footerProps} />}
    </div>
  )
}