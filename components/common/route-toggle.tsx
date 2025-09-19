"use client"

import { useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { icons } from "@/lib/icons"

interface RouteToggleProps {
  defaultValue?: "optimal" | "economic"
  onValueChange?: (value: "optimal" | "economic") => void
  className?: string
  size?: "sm" | "md" | "lg"
}

export function RouteToggle({
  defaultValue = "optimal",
  onValueChange,
  className = "",
  size = "md",
}: RouteToggleProps) {
  const [value, setValue] = useState(defaultValue)

  const RouteIcon = icons.route
  const WalletIcon = icons.wallet

  const handleValueChange = (newValue: string) => {
    if (newValue && (newValue === "optimal" || newValue === "economic")) {
      setValue(newValue)
      onValueChange?.(newValue)
    }
  }

  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-10",
    lg: "h-12 text-lg",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={handleValueChange}
      className={`rounded-xl bg-muted p-1 ${className}`}
    >
      <ToggleGroupItem
        value="optimal"
        className={`rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm ${sizeClasses[size]}`}
        aria-label="Ruta óptima"
      >
        <RouteIcon className={`mr-2 ${iconSizes[size]}`} />
        Óptima
      </ToggleGroupItem>
      <ToggleGroupItem
        value="economic"
        className={`rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm ${sizeClasses[size]}`}
        aria-label="Ruta económica"
      >
        <WalletIcon className={`mr-2 ${iconSizes[size]}`} />
        Económica
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
