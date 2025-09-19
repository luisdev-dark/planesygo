"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { copy } from "@/lib/copy"
import { icons } from "@/lib/icons"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCity, setSelectedCity] = useState("")
  const [routeOptimal, setRouteOptimal] = useState(true)
  const [avoidTransfers, setAvoidTransfers] = useState(false)
  const router = useRouter()

  const MapIcon = icons.map
  const CalendarIcon = icons.calendar
  const WalletIcon = icons.wallet
  const CloudIcon = icons.cloud
  const SunIcon = icons.sun
  const DollarSignIcon = icons.dollarSign
  const PlusIcon = icons.plus
  const BookmarkIcon = icons.bookmark
  const SettingsIcon = icons.settings
  const SearchIcon = icons.search

  const handlePlanTrip = () => {
    router.push("/dashboard/plan")
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">¡Bienvenido de vuelta!</h1>
        <p className="text-muted-foreground">Planifica tu próxima aventura con ViajeSmart</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main map area */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapIcon className="h-5 w-5 text-primary" />
                    Mapa Interactivo
                  </CardTitle>
                  <CardDescription>Explora destinos y rutas optimizadas</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="w-40 rounded-xl">
                      <SelectValue placeholder="Ciudad base" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="madrid">Madrid</SelectItem>
                      <SelectItem value="barcelona">Barcelona</SelectItem>
                      <SelectItem value="sevilla">Sevilla</SelectItem>
                      <SelectItem value="valencia">Valencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Map placeholder */}
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center border-2 border-dashed border-primary/20">
                <div className="text-center space-y-2">
                  <MapIcon className="h-12 w-12 text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">Mapa interactivo (Mapbox)</p>
                  <p className="text-xs text-muted-foreground">Selecciona una ciudad base para comenzar</p>
                </div>
              </div>

              {/* Map controls */}
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="route-optimal"
                    checked={routeOptimal}
                    onCheckedChange={setRouteOptimal}
                    aria-describedby="route-help"
                  />
                  <Label htmlFor="route-optimal" className="text-sm">
                    {routeOptimal ? "Rutas óptimas" : "Más económicas"}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="avoid-transfers"
                    checked={avoidTransfers}
                    onCheckedChange={setAvoidTransfers}
                    aria-describedby="transfers-help"
                  />
                  <Label htmlFor="avoid-transfers" className="text-sm">
                    Evitar transbordos
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Button 
              className="w-full bg-cta hover:bg-cta-hover text-cta-foreground rounded-xl h-auto p-4"
              onClick={handlePlanTrip}
            >
              <div className="flex flex-col items-center gap-2">
                <PlusIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Nuevo itinerario</span>
              </div>
            </Button>
            <Button variant="outline" className="w-full rounded-xl h-auto p-4 bg-transparent">
              <div className="flex flex-col items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Importar preferencias</span>
              </div>
            </Button>
            <Button variant="outline" className="w-full rounded-xl h-auto p-4 bg-transparent">
              <div className="flex flex-col items-center gap-2">
                <BookmarkIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Ver recomendaciones</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Trip summary */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon className="h-4 w-4 text-primary" />
                Resumen del viaje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay viajes planificados</p>
                <Button 
                  size="sm" 
                  className="mt-2 bg-cta hover:bg-cta-hover text-cta-foreground"
                  onClick={handlePlanTrip}
                >
                  {copy.onboarding.getStarted}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Weather widget */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <SunIcon className="h-4 w-4 text-primary" />
                Clima estimado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hoy</span>
                  <div className="flex items-center gap-2">
                    <SunIcon className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">22°C</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mañana</span>
                  <div className="flex items-center gap-2">
                    <CloudIcon className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">18°C</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pasado mañana</span>
                  <div className="flex items-center gap-2">
                    <icons.cloudRain className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">15°C</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Currency converter */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSignIcon className="h-4 w-4 text-primary" />
                Conversión rápida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Select defaultValue="eur">
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eur">EUR</SelectItem>
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="gbp">GBP</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="usd">
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="eur">EUR</SelectItem>
                    <SelectItem value="gbp">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="100" className="rounded-xl" />
              <div className="text-center p-3 bg-muted rounded-xl">
                <span className="text-lg font-semibold">$108.50</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}