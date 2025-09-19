"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { copy } from "@/lib/copy"
import { icons } from "@/lib/icons"

export default function ConfiguracionPage() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    language: "es",
    currency: "eur",
    distanceUnit: "km",
  })

  const [preferences, setPreferences] = useState({
    budgetType: "medium",
    travelStyle: ["cultural", "gastronomy"],
    accommodationType: "hotel",
    notifications: true,
    darkMode: false,
  })

  const [integrations, setIntegrations] = useState({
    mapbox: false,
    weather: true,
    currency: true,
  })

  const [privacy, setPrivacy] = useState({
    shareData: false,
    personalizedAds: false,
  })

  const UserIcon = icons.user
  const MapIcon = icons.map
  const DollarSignIcon = icons.dollarSign
  const RouteIcon = icons.route
  const SettingsIcon = icons.settings
  const SaveIcon = icons.save
  const CloudIcon = icons.cloud
  const InfoIcon = icons.info
  const RefreshIcon = icons.chevronDown
  const AlertCircleIcon = icons.alertCircle
  const NavigationIcon = icons.navigation
  const MailIcon = icons.mail

  const handleSave = () => {
    // Simulate saving settings
    console.log("Settings saved", { userData, preferences, integrations, privacy })
    // Show success toast
  }

  const handleReset = () => {
    // Reset to default values
    setUserData({
      name: "",
      email: "",
      language: "es",
      currency: "eur",
      distanceUnit: "km",
    })
    setPreferences({
      budgetType: "medium",
      travelStyle: [],
      accommodationType: "hotel",
      notifications: true,
      darkMode: false,
    })
    setIntegrations({
      mapbox: false,
      weather: true,
      currency: true,
    })
    setPrivacy({
      shareData: false,
      personalizedAds: false,
    })
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Personaliza tu experiencia en PlanesyGo</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 rounded-xl">
              <TabsTrigger value="account" className="rounded-lg">
                Cuenta
              </TabsTrigger>
              <TabsTrigger value="preferences" className="rounded-lg">
                Preferencias
              </TabsTrigger>
              <TabsTrigger value="integrations" className="rounded-lg">
                Integraciones
              </TabsTrigger>
              <TabsTrigger value="privacy" className="rounded-lg">
                Privacidad
              </TabsTrigger>
            </TabsList>

            {/* Account settings */}
            <TabsContent value="account" className="space-y-6">
              <Card className="rounded-2xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    Información de la cuenta
                  </CardTitle>
                  <CardDescription>
                    Actualiza tus datos personales y de contacto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Idioma</Label>
                      <Select
                        value={userData.language}
                        onValueChange={(value) => setUserData({ ...userData, language: value })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Moneda</Label>
                      <Select
                        value={userData.currency}
                        onValueChange={(value) => setUserData({ ...userData, currency: value })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="gbp">GBP (£)</SelectItem>
                          <SelectItem value="jpy">JPY (¥)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="distance">Unidad de distancia</Label>
                      <Select
                        value={userData.distanceUnit}
                        onValueChange={(value) => setUserData({ ...userData, distanceUnit: value })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="km">Kilómetros (km)</SelectItem>
                          <SelectItem value="mi">Millas (mi)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences settings */}
            <TabsContent value="preferences" className="space-y-6">
              <Card className="rounded-2xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5 text-primary" />
                    Preferencias de viaje
                  </CardTitle>
                  <CardDescription>
                    Configura tus preferencias para itinerarios personalizados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="budget">Tipo de presupuesto</Label>
                      <Select
                        value={preferences.budgetType}
                        onValueChange={(value) => setPreferences({ ...preferences, budgetType: value })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Bajo</SelectItem>
                          <SelectItem value="medium">Medio</SelectItem>
                          <SelectItem value="high">Alto</SelectItem>
                          <SelectItem value="luxury">Lujo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="accommodation">Tipo de alojamiento</Label>
                      <Select
                        value={preferences.accommodationType}
                        onValueChange={(value) => setPreferences({ ...preferences, accommodationType: value })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hostel">Hostel</SelectItem>
                          <SelectItem value="hotel">Hotel</SelectItem>
                          <SelectItem value="apartment">Apartamento</SelectItem>
                          <SelectItem value="resort">Resort</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Estilo de viaje</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[
                          { id: "adventure", label: "Aventura" },
                          { id: "cultural", label: "Cultural" },
                          { id: "relax", label: "Relax" },
                          { id: "gastronomy", label: "Gastronomía" },
                          { id: "nightlife", label: "Nocturno" },
                          { id: "family", label: "Familiar" },
                        ].map((style) => (
                          <Badge
                            key={style.id}
                            variant={preferences.travelStyle.includes(style.id) ? "default" : "outline"}
                            className="rounded-full cursor-pointer"
                            onClick={() => {
                              if (preferences.travelStyle.includes(style.id)) {
                                setPreferences({
                                  ...preferences,
                                  travelStyle: preferences.travelStyle.filter((s) => s !== style.id),
                                })
                              } else {
                                setPreferences({
                                  ...preferences,
                                  travelStyle: [...preferences.travelStyle, style.id],
                                })
                              }
                            }}
                          >
                            {style.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">Notificaciones</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe alertas sobre tus viajes y ofertas
                        </p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={preferences.notifications}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: checked as boolean })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="darkMode">Modo oscuro</Label>
                        <p className="text-sm text-muted-foreground">
                          Cambia el tema de la aplicación
                        </p>
                      </div>
                      <Switch
                        id="darkMode"
                        checked={preferences.darkMode}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, darkMode: checked as boolean })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Integrations settings */}
            <TabsContent value="integrations" className="space-y-6">
              <Card className="rounded-2xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapIcon className="h-5 w-5 text-primary" />
                    Integraciones de servicios
                  </CardTitle>
                  <CardDescription>
                    Conecta servicios externos para mejorar tu experiencia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <MapIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">Mapbox</div>
                          <div className="text-sm text-muted-foreground">
                            Mapas interactivos y rutas optimizadas
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={integrations.mapbox}
                        onCheckedChange={(checked) => setIntegrations({ ...integrations, mapbox: checked as boolean })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <CloudIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">Clima</div>
                          <div className="text-sm text-muted-foreground">
                            Información meteorológica en tiempo real
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={integrations.weather}
                        onCheckedChange={(checked) => setIntegrations({ ...integrations, weather: checked as boolean })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <DollarSignIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">Moneda</div>
                          <div className="text-sm text-muted-foreground">
                            Conversión de divisas actualizada
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={integrations.currency}
                        onCheckedChange={(checked) => setIntegrations({ ...integrations, currency: checked as boolean })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy settings */}
            <TabsContent value="privacy" className="space-y-6">
              <Card className="rounded-2xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <InfoIcon className="h-5 w-5 text-primary" />
                    Privacidad y seguridad
                  </CardTitle>
                  <CardDescription>
                    Gestiona tus datos y preferencias de privacidad
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="shareData">Compartir datos anónimos</Label>
                        <p className="text-sm text-muted-foreground">
                          Ayuda a mejorar PlanesyGo con datos de uso anónimos
                        </p>
                      </div>
                      <Switch
                        id="shareData"
                        checked={privacy.shareData}
                        onCheckedChange={(checked) => setPrivacy({ ...privacy, shareData: checked as boolean })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="personalizedAds">Anuncios personalizados</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe anuncios basados en tus intereses
                        </p>
                      </div>
                      <Switch
                        id="personalizedAds"
                        checked={privacy.personalizedAds}
                        onCheckedChange={(checked) => setPrivacy({ ...privacy, personalizedAds: checked as boolean })}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <Label>Exportar tus datos</Label>
                      <p className="text-sm text-muted-foreground">
                        Descarga una copia de toda tu información personal
                      </p>
                      <Button variant="outline" className="mt-2 rounded-xl">
                        <icons.download className="mr-2 h-4 w-4" />
                        Exportar datos
                      </Button>
                    </div>
                    <div>
                      <Label>Eliminar cuenta</Label>
                      <p className="text-sm text-muted-foreground">
                        Elimina permanentemente tu cuenta y todos tus datos
                      </p>
                      <Button variant="destructive" className="mt-2 rounded-xl">
                        <icons.trash className="mr-2 h-4 w-4" />
                        Eliminar cuenta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Actions card */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleSave}
                className="w-full bg-cta hover:bg-cta-hover text-cta-foreground rounded-xl"
              >
                <SaveIcon className="mr-2 h-4 w-4" />
                Guardar cambios
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full rounded-xl"
              >
                <RefreshIcon className="mr-2 h-4 w-4" />
                Restablecer valores
              </Button>
            </CardContent>
          </Card>

          {/* Info card */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Las notificaciones requieren permiso</span>
              </div>
              <div className="flex items-center gap-2">
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Tus datos están cifrados</span>
              </div>
              <div className="flex items-center gap-2">
                <NavigationIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Los cambios se aplican globalmente</span>
              </div>
            </CardContent>
          </Card>

          {/* Support card */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Ayuda y soporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start rounded-xl">
                <InfoIcon className="mr-2 h-4 w-4" />
                Centro de ayuda
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-xl">
                <MailIcon className="mr-2 h-4 w-4" />
                Contactar soporte
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-xl">
                <InfoIcon className="mr-2 h-4 w-4" />
                Enviar feedback
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}