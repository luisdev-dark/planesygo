"use client"

import { Button } from "@/components/ui/button"
import { icons } from "@/lib/icons"

interface ActionBarProps {
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ComponentType<{ className?: string }>
    disabled?: boolean
  }
  secondaryActions?: {
    label: string
    onClick: () => void
    icon?: React.ComponentType<{ className?: string }>
    disabled?: boolean
  }[]
  ghostActions?: {
    label: string
    onClick: () => void
    icon?: React.ComponentType<{ className?: string }>
    disabled?: boolean
  }[]
  className?: string
  size?: "sm" | "md" | "lg"
}

export function ActionBar({
  primaryAction,
  secondaryActions = [],
  ghostActions = [],
  className = "",
  size = "md",
}: ActionBarProps) {
  const sizeClasses = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  }

  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* Primary action */}
      {primaryAction && (
        <Button
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
          className={`${sizeClasses[size]} bg-cta hover:bg-cta-hover text-cta-foreground rounded-xl`}
        >
          {primaryAction.icon && (
            <primaryAction.icon className={`mr-2 ${iconSizeClasses[size]}`} />
          )}
          {primaryAction.label}
        </Button>
      )}

      {/* Secondary actions */}
      {secondaryActions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          onClick={action.onClick}
          disabled={action.disabled}
          className={`${sizeClasses[size]} rounded-xl`}
        >
          {action.icon && (
            <action.icon className={`mr-2 ${iconSizeClasses[size]}`} />
          )}
          {action.label}
        </Button>
      ))}

      {/* Ghost actions */}
      {ghostActions.map((action, index) => (
        <Button
          key={index}
          variant="ghost"
          onClick={action.onClick}
          disabled={action.disabled}
          className={`${sizeClasses[size]} rounded-xl`}
        >
          {action.icon && (
            <action.icon className={`mr-2 ${iconSizeClasses[size]}`} />
          )}
          {action.label}
        </Button>
      ))}
    </div>
  )
}

// Predefined action bars for common use cases
export function PlanTripActionBar({ onPlan, onImport, onRecommendations }: {
  onPlan?: () => void
  onImport?: () => void
  onRecommendations?: () => void
}) {
  return (
    <ActionBar
      primaryAction={{
        label: "Planear viaje",
        onClick: onPlan || (() => {}),
        icon: icons.plus,
      }}
      secondaryActions={[
        {
          label: "Importar preferencias",
          onClick: onImport || (() => {}),
          icon: icons.settings,
        },
        {
          label: "Ver recomendaciones",
          onClick: onRecommendations || (() => {}),
          icon: icons.bookmark,
        },
      ]}
    />
  )
}

export function ItineraryActionBar({ onSave, onExport, onRefine }: {
  onSave?: () => void
  onExport?: () => void
  onRefine?: () => void
}) {
  return (
    <ActionBar
      primaryAction={{
        label: "Guardar itinerario",
        onClick: onSave || (() => {}),
        icon: icons.save,
      }}
      secondaryActions={[
        {
          label: "Exportar",
          onClick: onExport || (() => {}),
          icon: icons.download,
        },
        {
          label: "Refinar con IA",
          onClick: onRefine || (() => {}),
          icon: icons.sliders,
        },
      ]}
    />
  )
}

export function FilterActionBar({ onApply, onReset }: {
  onApply?: () => void
  onReset?: () => void
}) {
  return (
    <ActionBar
      primaryAction={{
        label: "Aplicar filtros",
        onClick: onApply || (() => {}),
      }}
      ghostActions={[
        {
          label: "Limpiar",
          onClick: onReset || (() => {}),
          icon: icons.close,
        },
      ]}
      size="sm"
    />
  )
}
