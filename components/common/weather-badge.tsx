"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { icons } from "@/lib/icons"

interface WeatherBadgeProps {
  condition: string
  temperature: number
  className?: string
  showTooltip?: boolean
  size?: "sm" | "md" | "lg"
}

export function WeatherBadge({
  condition,
  temperature,
  className = "",
  showTooltip = true,
  size = "md",
}: WeatherBadgeProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    sm: "h-6 px-2 text-xs",
    md: "h-8 px-3 text-sm",
    lg: "h-10 px-4 text-base",
  }

  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    const normalizedCondition = condition.toLowerCase()
    
    if (normalizedCondition.includes("sun") || normalizedCondition.includes("soleado")) {
      return icons.sun
    } else if (normalizedCondition.includes("cloud") || normalizedCondition.includes("nublado")) {
      return icons.cloud
    } else if (normalizedCondition.includes("rain") || normalizedCondition.includes("lluvia")) {
      return icons.cloudRain
    } else if (normalizedCondition.includes("snow") || normalizedCondition.includes("nieve")) {
      return icons.cloud
    } else if (normalizedCondition.includes("storm") || normalizedCondition.includes("tormenta")) {
      return icons.cloud
    } else if (normalizedCondition.includes("wind") || normalizedCondition.includes("viento")) {
      return icons.navigation
    } else {
      return icons.sun // Default to sun
    }
  }

  // Get weather color based on condition
  const getWeatherColor = (condition: string) => {
    const normalizedCondition = condition.toLowerCase()
    
    if (normalizedCondition.includes("sun") || normalizedCondition.includes("soleado")) {
      return "bg-amber-100 text-amber-800 hover:bg-amber-200"
    } else if (normalizedCondition.includes("cloud") || normalizedCondition.includes("nublado")) {
      return "bg-slate-100 text-slate-800 hover:bg-slate-200"
    } else if (normalizedCondition.includes("rain") || normalizedCondition.includes("lluvia")) {
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    } else if (normalizedCondition.includes("snow") || normalizedCondition.includes("nieve")) {
      return "bg-cyan-100 text-cyan-800 hover:bg-cyan-200"
    } else if (normalizedCondition.includes("storm") || normalizedCondition.includes("tormenta")) {
      return "bg-purple-100 text-purple-800 hover:bg-purple-200"
    } else if (normalizedCondition.includes("wind") || normalizedCondition.includes("viento")) {
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    } else {
      return "bg-amber-100 text-amber-800 hover:bg-amber-200"
    }
  }

  const WeatherIcon = getWeatherIcon(condition)
  const weatherColor = getWeatherColor(condition)

  const badgeContent = (
    <Badge
      variant="outline"
      className={`${sizeClasses[size]} ${weatherColor} rounded-full flex items-center gap-1 ${className} transition-colors`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <WeatherIcon className={iconSizeClasses[size]} />
      <span>{temperature}°C</span>
    </Badge>
  )

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent>
            <p>Pronóstico: {condition}</p>
            <p>Temperatura: {temperature}°C</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return badgeContent
}

// Component for weather forecast with multiple days
interface WeatherForecastProps {
  forecast: {
    day: string
    date: string
    condition: string
    temperature: number
  }[]
  className?: string
}

export function WeatherForecast({ forecast, className = "" }: WeatherForecastProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {forecast.map((day, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-sm font-medium">{day.day}</span>
          <WeatherBadge
            condition={day.condition}
            temperature={day.temperature}
            size="sm"
          />
        </div>
      ))}
    </div>
  )
}

// Component for weather alert
interface WeatherAlertProps {
  message: string
  severity: "low" | "medium" | "high"
  className?: string
}

export function WeatherAlert({ message, severity, className = "" }: WeatherAlertProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-50 border-blue-200 text-blue-800"
      case "medium":
        return "bg-amber-50 border-amber-200 text-amber-800"
      case "high":
        return "bg-red-50 border-red-200 text-red-800"
      default:
        return "bg-blue-50 border-blue-200 text-blue-800"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low":
        return icons.info
      case "medium":
        return icons.alertCircle
      case "high":
        return icons.alertCircle
      default:
        return icons.info
    }
  }

  const SeverityIcon = getSeverityIcon(severity)
  const severityColor = getSeverityColor(severity)

  return (
    <div className={`p-3 rounded-xl border ${severityColor} ${className}`}>
      <div className="flex items-start gap-2">
        <SeverityIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  )
}
