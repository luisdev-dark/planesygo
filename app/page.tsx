import { Logo } from "@/components/common/logo"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { copy } from "@/lib/copy"
import { icons } from "@/lib/icons"
import Link from "next/link"

export default function HomePage() {
  const MapIcon = icons.map
  const CalendarIcon = icons.calendar
  const WalletIcon = icons.wallet

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">{copy.buttons.login}</Button>
            </Link>
            <Link href="/dashboard/plan">
              <Button className="bg-cta hover:bg-cta-hover text-cta-foreground">{copy.buttons.planTrip}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            Genera itinerarios de viaje <span className="text-primary">personalizados</span> con IA
          </h1>
          <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
            PlanesyGo crea itinerarios únicos adaptados a tus preferencias, presupuesto y estilo de viaje. Descubre
            experiencias auténticas con la precisión de la inteligencia artificial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/plan">
              <Button size="lg" className="bg-cta hover:bg-cta-hover text-cta-foreground">
                {copy.buttons.planTrip}
              </Button>
            </Link>
            <Button size="lg" variant="outline" onClick={() => window.location.href = "/dashboard/resultados"}>
              Ver ejemplo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapIcon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Rutas Inteligentes</CardTitle>
              <CardDescription>
                Optimizamos tus rutas considerando distancias, costos y preferencias de transporte
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Planificación Detallada</CardTitle>
              <CardDescription>
                Itinerarios día a día con horarios, actividades y recomendaciones locales
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <WalletIcon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Control de Presupuesto</CardTitle>
              <CardDescription>
                Ajustamos las recomendaciones a tu presupuesto con conversión de monedas en tiempo real
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  )
}
