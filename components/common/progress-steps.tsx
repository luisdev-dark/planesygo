"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { icons } from "@/lib/icons"

interface ProgressStepsProps {
  steps: {
    id: string
    title: string
    description: string
    status: "pending" | "in-progress" | "completed"
  }[]
  currentStep: number
  className?: string
}

export function ProgressSteps({ steps, currentStep, className = "" }: ProgressStepsProps) {
  const progress = (currentStep / steps.length) * 100

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Generando itinerario</span>
          <span>{Math.round(progress)}% completado</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index < currentStep
          const isCurrent = index === currentStep - 1
          const isCompleted = step.status === "completed"

          let statusIcon
          if (isCompleted) {
            statusIcon = <icons.checkCircle className="h-5 w-5 text-green-500" />
          } else if (isCurrent) {
            statusIcon = <icons.loading className="h-5 w-5 text-primary animate-spin" />
          } else {
            statusIcon = <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
          }

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                isCurrent ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">{statusIcon}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{step.title}</h3>
                  {isCurrent && (
                    <Badge variant="outline" className="rounded-full text-xs">
                      En progreso
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Component for itinerary generation progress
export function ItineraryGenerationProgress({ className = "" }: { className?: string }) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const steps = [
    {
      id: "analyzing",
      title: "Analizando preferencias",
      description: "Procesando tus intereses y requisitos de viaje",
      status: "pending" as const,
    },
    {
      id: "searching",
      title: "Buscando destinos",
      description: "Encontrando lugares y actividades que coincidan con tus preferencias",
      status: "pending" as const,
    },
    {
      id: "planning",
      title: "Planificando rutas",
      description: "Optimizando itinerarios y tiempos de desplazamiento",
      status: "pending" as const,
    },
    {
      id: "finalizing",
      title: "Finalizando detalles",
      description: "Ajustando costos y preparando tu itinerario final",
      status: "pending" as const,
    },
  ]

  // Simulate progress steps
  useState(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 2000)

    return () => clearInterval(interval)
  })

  return (
    <Card className={`rounded-2xl shadow-lg border-0 ${className}`}>
      <CardContent className="pt-6">
        <ProgressSteps steps={steps} currentStep={currentStep} />
      </CardContent>
    </Card>
  )
}
