"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { icons } from "@/lib/icons"

interface Step {
  id: string
  title: string
  description?: string
  status: "completed" | "current" | "upcoming"
}

interface StepperProps {
  steps: Step[]
  currentStep: string
  onStepClick?: (stepId: string) => void
  className?: string
  orientation?: "horizontal" | "vertical"
  showNumbers?: boolean
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  className = "",
  orientation = "horizontal",
  showNumbers = true,
}: StepperProps) {
  const CheckIcon = icons.checkCircle
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep)

  const getStepStatus = (index: number): Step["status"] => {
    if (index < currentStepIndex) return "completed"
    if (index === currentStepIndex) return "current"
    return "upcoming"
  }

  const getStepIcon = (step: Step, index: number) => {
    const status = getStepStatus(index)

    if (status === "completed") {
      return <CheckIcon className="h-5 w-5 text-white" />
    }

    if (showNumbers) {
      return <span className="text-sm font-medium">{index + 1}</span>
    }

    return null
  }

  const getStepClasses = (step: Step, index: number) => {
    const status = getStepStatus(index)

    const baseClasses = "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors"

    switch (status) {
      case "completed":
        return `${baseClasses} bg-primary border-primary text-primary-foreground`
      case "current":
        return `${baseClasses} bg-primary border-primary text-primary-foreground`
      case "upcoming":
        return `${baseClasses} bg-background border-muted-foreground/30 text-muted-foreground`
    }
  }

  const getConnectorClasses = (index: number) => {
    const isCompleted = index < currentStepIndex
    return `flex-1 h-0.5 ${isCompleted ? "bg-primary" : "bg-muted-foreground/30"}`
  }

  if (orientation === "vertical") {
    return (
      <div className={`space-y-4 ${className}`}>
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const isLast = index === steps.length - 1
          const isClickable = onStepClick && status !== "upcoming"

          return (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-0 h-8 w-8 ${getStepClasses(step, index)} ${
                    isClickable ? "cursor-pointer hover:scale-105" : "cursor-default"
                  }`}
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                >
                  {getStepIcon(step, index)}
                </Button>
                {!isLast && <div className="w-0.5 h-8 bg-muted-foreground/30 mt-2" />}
              </div>
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-medium ${status === "current" ? "text-primary" : ""}`}>{step.title}</h4>
                  {status === "current" && <Badge className="bg-primary/10 text-primary">Actual</Badge>}
                  {status === "completed" && <Badge className="bg-green-100 text-green-800">Completado</Badge>}
                </div>
                {step.description && <p className="text-sm text-muted-foreground">{step.description}</p>}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`flex items-center ${className}`}>
      {steps.map((step, index) => {
        const status = getStepStatus(index)
        const isLast = index === steps.length - 1
        const isClickable = onStepClick && status !== "upcoming"

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="sm"
                className={`p-0 h-8 w-8 ${getStepClasses(step, index)} ${
                  isClickable ? "cursor-pointer hover:scale-105" : "cursor-default"
                }`}
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
              >
                {getStepIcon(step, index)}
              </Button>
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${status === "current" ? "text-primary" : ""}`}>{step.title}</div>
                {step.description && <div className="text-xs text-muted-foreground mt-1">{step.description}</div>}
              </div>
            </div>
            {!isLast && <div className={`mx-4 ${getConnectorClasses(index)}`} />}
          </div>
        )
      })}
    </div>
  )
}
