"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { copy } from "@/lib/copy"
import { icons } from "@/lib/icons"
import { useRouter } from "next/navigation"

interface PlanningData {
  originCountry: string
  destination: string
  startDate: string
  endDate: string
  duration: number
  budget: number[]
  currency: string
  styles: string[]
  transport: string
  preferences: string[]
}

const travelStyles = [
  { id: "adventure", label: "Aventura", icon: icons.mountain },
  { id: "cultural", label: "Cultural", icon: icons.landmark },
  { id: "relax", label: "Relax", icon: icons.sun },
  { id: "gastronomy", label: "Gastronomía", icon: icons.utensils },
  { id: "nightlife", label: "Nocturno", icon: icons.clock },
  { id: "family", label: "Familiar", icon: icons.home },
]

const transportPreferences = [
  { value: "cheap", label: "Más barato", description: "Prioriza el menor costo" },
  { value: "comfortable", label: "Más cómodo", description: "Prioriza comodidad y tiempo" },
  { value: "mixed", label: "Mixto", description: "Balance entre precio y comodidad" },
]

const additionalPreferences = [
  { id: "avoid-transfers", label: "Evitar escalas largas" },
  { id: "public-transport", label: "Solo transporte público" },
  { id: "eco-friendly", label: "Opciones eco-friendly" },
  { id: "accessibility", label: "Accesibilidad requerida" },
]

export default function PlanPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState<PlanningData>({
    originCountry: "Perú", // Valor por defecto según lo solicitado
    destination: "",
    startDate: "",
    endDate: "",
    duration: 7,
    budget: [1000],
    currency: "eur",
    styles: [],
    transport: "",
    preferences: [],
  })

  // Efecto para calcular la duración cuando cambian las fechas
  useEffect(() => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // Incluye ambos días
        
        setData(prev => ({
          ...prev,
          duration: diffDays
        }))
      }
    }
  }, [data.startDate, data.endDate])

  // Efecto para calcular la fecha de fin cuando cambia la duración
  useEffect(() => {
    if (data.startDate && data.duration > 0) {
      const start = new Date(data.startDate)
      
      if (!isNaN(start.getTime())) {
        const end = new Date(start)
        end.setDate(start.getDate() + data.duration - 1) // -1 porque ya incluye el día de inicio
        
        // Formatear la fecha como YYYY-MM-DD para el input date
        const formattedEnd = end.toISOString().split('T')[0]
        
        setData(prev => ({
          ...prev,
          endDate: formattedEnd
        }))
      }
    }
  }, [data.startDate, data.duration])

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const InfoIcon = icons.info
  const ChevronLeftIcon = icons.chevronLeft
  const ChevronRightIcon = icons.chevronRight
  const LoaderIcon = icons.loading
  const AlertIcon = icons.alertCircle

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
      setError("")
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setError("")
  }

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!data.originCountry || !data.destination || !data.startDate || !data.endDate) {
          setError("Por favor completa todos los campos requeridos")
          return false
        }
        break
      case 2:
        if (data.budget[0] < 100) {
          setError("El presupuesto mínimo es de 100€")
          return false
        }
        break
      case 3:
        if (data.styles.length === 0) {
          setError("Selecciona al menos un estilo de viaje")
          return false
        }
        break
      case 4:
        if (!data.transport) {
          setError("Selecciona una preferencia de transporte")
          return false
        }
        break
    }
    return true
  }

  const handleGenerate = async () => {
    if (!validateStep()) return

    setIsLoading(true)
    setError("")

    try {
      // Preparar los datos para enviar a la API
      const preferences = [
        ...data.styles,
        data.transport,
        ...data.preferences
      ]

      const requestData = {
        originCountry: data.originCountry,
        destination: data.destination,
        days: data.duration,
        budget: data.budget[0],
        travelStyle: data.styles.join(", "),
        preferences: preferences,
        currency: data.currency.toUpperCase()
      }

      console.log("Enviando datos a la API:", requestData)

      // Llamar a la API para generar el itinerario
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al generar el itinerario')
      }

      const result = await response.json()
      console.log("Respuesta de la API:", result)

      // Guardar los resultados en localStorage para mostrarlos en la página de resultados
      localStorage.setItem('itineraryResults', JSON.stringify({
        itinerary: result.itinerary,
        metadata: result.metadata,
        planningData: data
      }))

      // Redirigir a la página de resultados
      console.log("Redirigiendo a /dashboard/resultados")
      
      // Usar window.location.href para una redirección más directa y evitar problemas con Analytics
      setTimeout(() => {
        window.location.href = "/dashboard/resultados"
      }, 100)
    } catch (error) {
      console.error('Error al generar el itinerario:', error)
      setError(error instanceof Error ? error.message : 'Error al generar el itinerario')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStyle = (styleId: string) => {
    setData((prev) => ({
      ...prev,
      styles: prev.styles.includes(styleId) ? prev.styles.filter((s) => s !== styleId) : [...prev.styles, styleId],
    }))
  }

  const togglePreference = (prefId: string) => {
    setData((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(prefId)
        ? prev.preferences.filter((p) => p !== prefId)
        : [...prev.preferences, prefId],
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 lg:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Planifica tu viaje perfecto</h1>
          <p className="text-muted-foreground">Responde unas preguntas para generar tu itinerario personalizado</p>
        </div>

        {/* Progress */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Paso {currentStep} de {totalSteps}
                </span>
                <span>{Math.round(progress)}% completado</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Main form */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && (
                <>
                  <icons.calendar className="h-5 w-5 text-primary" />
                  Fechas y duración
                </>
              )}
              {currentStep === 2 && (
                <>
                  <icons.wallet className="h-5 w-5 text-primary" />
                  Presupuesto
                </>
              )}
              {currentStep === 3 && (
                <>
                  <icons.camera className="h-5 w-5 text-primary" />
                  Estilo de viaje
                </>
              )}
              {currentStep === 4 && (
                <>
                  <icons.bus className="h-5 w-5 text-primary" />
                  Transporte
                </>
              )}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "¿Desde dónde y cuándo quieres viajar?"}
              {currentStep === 2 && "Define tu presupuesto para el viaje completo"}
              {currentStep === 3 && "¿Qué tipo de experiencias te interesan más?"}
              {currentStep === 4 && "Preferencias de transporte y movilidad"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Dates and Duration */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="origin-country">País de residencia</Label>
                  <Input
                    id="origin-country"
                    placeholder="Ej: Perú"
                    value={data.originCountry}
                    onChange={(e) => setData((prev) => ({ ...prev, originCountry: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destino</Label>
                  <Input
                    id="destination"
                    placeholder="Ej: China, Beijing"
                    value={data.destination}
                    onChange={(e) => setData((prev) => ({ ...prev, destination: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Fecha de inicio</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={data.startDate}
                      onChange={(e) => setData((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">Fecha de fin</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={data.endDate}
                      onChange={(e) => setData((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="rounded-xl"
                      disabled={!data.startDate} // Deshabilitar si no hay fecha de inicio
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Duración estimada: {data.duration} días</Label>
                  <Slider
                    value={[data.duration]}
                    onValueChange={(value) => setData((prev) => ({ ...prev, duration: value[0] }))}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                    disabled={!data.startDate} // Deshabilitar si no hay fecha de inicio
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 día</span>
                    <span>30 días</span>
                  </div>
                  {!data.startDate && (
                    <p className="text-xs text-muted-foreground">
                      Selecciona primero una fecha de inicio para ajustar la duración
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Budget */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label>Presupuesto total</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copy.help.budget}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Select
                      value={data.currency}
                      onValueChange={(value) => setData((prev) => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="w-20 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eur">EUR</SelectItem>
                        <SelectItem value="usd">USD</SelectItem>
                        <SelectItem value="gbp">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={data.budget[0]}
                      onChange={(e) => setData((prev) => ({ ...prev, budget: [Number.parseInt(e.target.value) || 0] }))}
                      className="rounded-xl"
                      min="100"
                    />
                  </div>
                  <Slider
                    value={data.budget}
                    onValueChange={(value) => setData((prev) => ({ ...prev, budget: value }))}
                    max={10000}
                    min={100}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>100€</span>
                    <span>10,000€</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Travel Style */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label>Selecciona tus estilos favoritos</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copy.help.style}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {travelStyles.map((style) => {
                    const Icon = style.icon
                    const isSelected = data.styles.includes(style.id)
                    return (
                      <Button
                        key={style.id}
                        variant={isSelected ? "default" : "outline"}
                        className={`h-auto p-4 rounded-xl ${
                          isSelected ? "bg-primary hover:bg-primary-hover" : "bg-transparent"
                        }`}
                        onClick={() => toggleStyle(style.id)}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Icon className="h-5 w-5" />
                          <span className="text-sm font-medium">{style.label}</span>
                        </div>
                      </Button>
                    )
                  })}
                </div>
                {data.styles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {data.styles.map((styleId) => {
                      const style = travelStyles.find((s) => s.id === styleId)
                      return (
                        <Badge key={styleId} variant="secondary" className="rounded-full">
                          {style?.label}
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Transport */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label>Preferencia de transporte</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copy.help.transport}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-3">
                  {transportPreferences.map((option) => (
                    <div
                      key={option.value}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        data.transport === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setData((prev) => ({ ...prev, transport: option.value }))}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            data.transport === option.value ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}
                        />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">{option.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Label>Preferencias adicionales</Label>
                  {additionalPreferences.map((pref) => (
                    <div key={pref.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={pref.id}
                        checked={data.preferences.includes(pref.id)}
                        onCheckedChange={() => togglePreference(pref.id)}
                      />
                      <Label htmlFor={pref.id} className="text-sm font-normal">
                        {pref.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="rounded-xl bg-transparent"
          >
            <ChevronLeftIcon className="mr-2 h-4 w-4" />
            {copy.buttons.back}
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext} className="bg-cta hover:bg-cta-hover text-cta-foreground rounded-xl">
              {copy.buttons.next}
              <ChevronRightIcon className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-cta hover:bg-cta-hover text-cta-foreground rounded-xl"
            >
              {isLoading ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  {copy.loading.generating}
                </>
              ) : (
                copy.buttons.generateItinerary
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}