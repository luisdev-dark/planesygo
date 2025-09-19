"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Logo } from "@/components/common/logo"
import { icons } from "@/lib/icons"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const GoogleIcon = icons.mail
  const GithubIcon = icons.github
  const InfoIcon = icons.info
  const LoaderIcon = icons.loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      // Simulate successful login
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("user", JSON.stringify({
        name: email.split('@')[0], // Extraer nombre del email
        email: email,
      }))
      
      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      setError("Credenciales inválidas. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsLoading(true)
    setError("")

    try {
      // Simulate social login
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Simulate successful login
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("user", JSON.stringify({
        name: `Usuario ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
        email: `usuario@${provider}.com`,
      }))
      
      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      setError(`No se pudo iniciar sesión con ${provider}. Por favor, inténtalo de nuevo.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[600px]">
          {/* Left side - Illustration */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center p-8 hidden lg:flex">
            <div className="text-center text-white">
              <Logo className="mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4">Bienvenido a PlanesyGo</h1>
              <p className="text-blue-100 max-w-md mx-auto">
                Genera itinerarios de viaje personalizados con inteligencia artificial. 
                Descubre destinos, planifica actividades y optimiza tu presupuesto.
              </p>
              <div className="mt-8 flex justify-center">
                <div className="w-64 h-64 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-blue-400/20 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-blue-300/20 flex items-center justify-center">
                      <icons.map className="h-16 w-16 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="flex items-center justify-center p-8">
            <div className="w-full max-w-md space-y-6">
              <div className="text-center lg:hidden">
                <Logo className="mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-slate-900">Bienvenido</h1>
                <p className="text-slate-600 mt-2">Genera itinerarios personalizados con IA</p>
              </div>

              <Card className="rounded-2xl shadow-lg border-0">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-center text-slate-900">
                    Iniciar sesión
                  </CardTitle>
                  <CardDescription className="text-center text-slate-600">
                    Ingresa tus credenciales para acceder a tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="rounded-xl">
                      <icons.alertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl"
                        required
                        aria-invalid={!!error}
                        aria-describedby={error ? "email-error" : undefined}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Contraseña</Label>
                        <Link href="#" className="text-sm text-blue-600 hover:text-blue-800">
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-xl"
                        required
                        aria-invalid={!!error}
                        aria-describedby={error ? "password-error" : undefined}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="remember" className="text-sm">
                        Recordarme
                      </Label>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                          Iniciando sesión...
                        </>
                      ) : (
                        "Ingresar"
                      )}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-slate-500">O continúa con</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => handleSocialLogin("google")}
                      disabled={isLoading}
                    >
                      <GoogleIcon className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => handleSocialLogin("github")}
                      disabled={isLoading}
                    >
                      <GithubIcon className="mr-2 h-4 w-4" />
                      GitHub
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center text-sm text-slate-600">
                ¿No tienes una cuenta?{" "}
                <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                  Crear cuenta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
