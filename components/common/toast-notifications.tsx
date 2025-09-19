"use client"

import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { copy } from "@/lib/copy"

// Custom toast functions for ViajeSmart
export function useViajesmartToasts() {
  const { toast } = useToast()

  const showSuccess = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 3000,
      className: "rounded-xl border-green-200 bg-green-50 text-green-900",
    })
  }

  const showError = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 5000,
      variant: "destructive",
      className: "rounded-xl",
    })
  }

  const showInfo = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 4000,
      className: "rounded-xl border-blue-200 bg-blue-50 text-blue-900",
    })
  }

  const showWarning = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 4000,
      className: "rounded-xl border-amber-200 bg-amber-50 text-amber-900",
    })
  }

  // Predefined toasts for common actions
  const itinerarySaved = () => showSuccess(copy.success.itinerarySaved, "Puedes encontrarlo en tu sección de guardados")

  const profileUpdated = () => showSuccess(copy.success.profileUpdated)

  const preferencesUpdated = () => showSuccess(copy.success.preferencesUpdated)

  const networkError = () => showError(copy.errors.networkError, "Verifica tu conexión e intenta de nuevo")

  const weatherUnavailable = () => showWarning(copy.errors.weatherUnavailable, "Mostrando datos aproximados")

  const newRecommendations = () =>
    showInfo(copy.info.newRecommendations, "Revisa las sugerencias actualizadas para tu viaje")

  const mapLoadError = () => showError(copy.errors.mapLoad, "El mapa no está disponible temporalmente")

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    itinerarySaved,
    profileUpdated,
    preferencesUpdated,
    networkError,
    weatherUnavailable,
    newRecommendations,
    mapLoadError,
  }
}

// Toast action buttons component
export function ToastActions({ onRetry, onDismiss }: { onRetry?: () => void; onDismiss?: () => void }) {
  return (
    <div className="flex gap-2 mt-2">
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="rounded-lg bg-transparent">
          {copy.buttons.retry}
        </Button>
      )}
      {onDismiss && (
        <Button size="sm" variant="ghost" onClick={onDismiss} className="rounded-lg">
          Cerrar
        </Button>
      )}
    </div>
  )
}
