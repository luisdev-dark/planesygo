"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
  onClick?: () => void
}

export function Logo({ className = "", size = "md", showText = true, onClick }: LogoProps) {
  const pathname = usePathname()

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  const textClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  const logoContent = (
    <div className={`flex items-center gap-2 ${className}`} onClick={onClick}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3/5 h-3/5 text-white"
        >
          <path d="M3 12h2l2-6l2 6h2" />
          <path d="M13 12h2l2-6l2 6h2" />
          <path d="M6 20h12" />
        </svg>
      </div>
      {showText && (
        <span className={`font-bold ${textClasses[size]}`}>PlanesyGo</span>
      )}
    </div>
  )

  if (onClick) {
    return logoContent
  }

  return <Link href="/dashboard">{logoContent}</Link>
}

// Component for the header logo
export function HeaderLogo({ className = "" }: { className?: string }) {
  return <Logo size="md" className={className} />
}

// Component for the sidebar logo
export function SidebarLogo({ className = "" }: { className?: string }) {
  return <Logo size="lg" className={className} />
}

// Component for the footer logo
export function FooterLogo({ className = "" }: { className?: string }) {
  return <Logo size="sm" className={className} />
}
