"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { icons } from "@/lib/icons"

interface FiltersBarProps {
  className?: string
  categories?: string[]
  onFiltersChange?: (filters: FiltersState) => void
}

interface FiltersState {
  category: string
  costRange: [number, number]
  timeOfDay: string[]
  maxDistance: number
}

const timeOptions = [
  { id: "morning", label: "Mañana" },
  { id: "afternoon", label: "Tarde" },
  { id: "evening", label: "Noche" },
]

export function FiltersBar({
  className = "",
  categories = ["Cultura", "Gastronomía", "Naturaleza", "Aventura", "Relax", "Compras"],
  onFiltersChange,
}: FiltersBarProps) {
  const [filters, setFilters] = useState<FiltersState>({
    category: "",
    costRange: [0, 200],
    timeOfDay: [],
    maxDistance: 10,
  })

  const [isExpanded, setIsExpanded] = useState(false)

  const FilterIcon = icons.filter
  const XIcon = icons.close

  const handleCategoryChange = (category: string) => {
    const newFilters = { ...filters, category }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleCostRangeChange = (value: number[]) => {
    const newFilters = { ...filters, costRange: [value[0], value[1]] as [number, number] }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleTimeOfDayToggle = (time: string) => {
    const newTimeOfDay = filters.timeOfDay.includes(time)
      ? filters.timeOfDay.filter((t) => t !== time)
      : [...filters.timeOfDay, time]
    
    const newFilters = { ...filters, timeOfDay: newTimeOfDay }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleMaxDistanceChange = (value: number) => {
    const newFilters = { ...filters, maxDistance: value }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const resetFilters = () => {
    const newFilters: FiltersState = {
      category: "",
      costRange: [0, 200],
      timeOfDay: [],
      maxDistance: 10,
    }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const hasActiveFilters = filters.category || 
    filters.costRange[0] > 0 || 
    filters.costRange[1] < 200 || 
    filters.timeOfDay.length > 0 || 
    filters.maxDistance < 10

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="rounded-2xl shadow-lg border-0 overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Filtros</h3>
              {hasActiveFilters && (
                <Badge variant="secondary" className="rounded-full">
                  Activos
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs rounded-xl"
                >
                  <XIcon className="mr-1 h-3 w-3" />
                  Limpiar
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs rounded-xl"
              >
                {isExpanded ? "Ocultar" : "Más"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Category filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <Select value={filters.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cost range filter */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Rango de costo</label>
                <span className="text-sm text-muted-foreground">
                  {filters.costRange[0]}€ - {filters.costRange[1]}€
                </span>
              </div>
              <Slider
                value={filters.costRange}
                onValueChange={handleCostRangeChange}
                max={200}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0€</span>
                <span>200€</span>
              </div>
            </div>

            {/* Time of day filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Horario</label>
              <div className="flex flex-wrap gap-2">
                {timeOptions.map((time) => (
                  <Badge
                    key={time.id}
                    variant={filters.timeOfDay.includes(time.id) ? "default" : "outline"}
                    className="rounded-full cursor-pointer"
                    onClick={() => handleTimeOfDayToggle(time.id)}
                  >
                    {time.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Additional filters (only when expanded) */}
            {isExpanded && (
              <div className="space-y-4 pt-2 border-t">
                {/* Max distance filter */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Distancia máxima</label>
                    <span className="text-sm text-muted-foreground">
                      {filters.maxDistance} km
                    </span>
                  </div>
                  <Slider
                    value={[filters.maxDistance]}
                    onValueChange={(value) => handleMaxDistanceChange(value[0])}
                    max={50}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
