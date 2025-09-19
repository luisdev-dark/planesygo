"use client"

import { Button } from "@/components/ui/button"
import { icons } from "@/lib/icons"
import { copy } from "@/lib/copy"

interface EmptyStateProps {
  icon?: keyof typeof icons
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  size?: "sm" | "md" | "lg"
}

export function EmptyState({
  icon = "mapPin",
  title,
  description,
  action,
  className = "",
  size = "md",
}: EmptyStateProps) {
  const Icon = icons[icon]

  const sizeClasses = {
    sm: {
      container: "py-8",
      icon: "h-8 w-8",
      title: "text-lg",
      description: "text-sm",
    },
    md: {
      container: "py-12",
      icon: "h-12 w-12",
      title: "text-xl",
      description: "text-base",
    },
    lg: {
      container: "py-16",
      icon: "h-16 w-16",
      title: "text-2xl",
      description: "text-lg",
    },
  }

  return (
    <div className={`text-center ${sizeClasses[size].container} ${className}`}>
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-muted/50 rounded-2xl">
          <Icon className={`${sizeClasses[size].icon} text-muted-foreground`} />
        </div>
      </div>
      <h3 className={`font-semibold mb-2 ${sizeClasses[size].title}`}>{title}</h3>
      <p className={`text-muted-foreground mb-6 max-w-md mx-auto ${sizeClasses[size].description}`}>{description}</p>
      {action && (
        <Button onClick={action.onClick} className="bg-cta hover:bg-cta-hover text-cta-foreground rounded-xl">
          {action.label}
        </Button>
      )}
    </div>
  )
}

export function NoTripsEmpty({ onCreateTrip }: { onCreateTrip: () => void }) {
  return (
    <EmptyState
      icon="calendar"
      title={copy.onboarding.firstTime}
      description="Crea tu primer itinerario personalizado con IA y descubre experiencias únicas adaptadas a tus gustos."
      action={{
        label: copy.onboarding.getStarted,
        onClick: onCreateTrip,
      }}
    />
  )
}

export function NoResultsEmpty({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon="search"
      title="No se encontraron resultados"
      description="No pudimos encontrar actividades que coincidan con tus criterios. Intenta ajustar los filtros o buscar en otra ubicación."
      action={{
        label: "Intentar de nuevo",
        onClick: onRetry,
      }}
    />
  )
}

export function NoSavedTripsEmpty({ onPlanTrip }: { onPlanTrip: () => void }) {
  return (
    <EmptyState
      icon="bookmark"
      title="No tienes viajes guardados"
      description="Los itinerarios que guardes aparecerán aquí para que puedas acceder a ellos fácilmente."
      action={{
        label: copy.buttons.planTrip,
        onClick: onPlanTrip,
      }}
    />
  )
}

export function ErrorState({
  onRetry,
  title,
  description,
}: { onRetry: () => void; title?: string; description?: string }) {
  return (
    <EmptyState
      icon="alertCircle"
      title={title || "Algo salió mal"}
      description={description || copy.errors.generic}
      action={{
        label: copy.buttons.retry,
        onClick: onRetry,
      }}
    />
  )
}
