"use client"

import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Logo } from "./logo"
import { icons } from "@/lib/icons"

interface FooterProps {
  className?: string
  showLogo?: boolean
  showNavigation?: boolean
  showSocial?: boolean
}

export function Footer({ className = "", showLogo = true, showNavigation = true, showSocial = true }: FooterProps) {
  const navigationLinks = [
    { title: "Inicio", href: "/app" },
    { title: "Planificar", href: "/app/plan" },
    { title: "Resultados", href: "/app/resultados" },
    { title: "Guardados", href: "/app/guardados" },
  ]

  const legalLinks = [
    { title: "Términos de servicio", href: "/terminos" },
    { title: "Política de privacidad", href: "/privacidad" },
    { title: "Cookies", href: "/cookies" },
  ]

  const socialLinks = [
    { title: "Twitter", href: "https://twitter.com/planesygo", icon: icons.info },
    { title: "Facebook", href: "https://facebook.com/planesygo", icon: icons.info },
    { title: "Instagram", href: "https://instagram.com/planesygo", icon: icons.info },
    { title: "LinkedIn", href: "https://linkedin.com/company/planesygo", icon: icons.info },
  ]

  return (
    <footer className={`bg-muted/50 border-t ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and description */}
          {showLogo && (
            <div className="space-y-4">
              <Logo size="md" />
              <p className="text-sm text-muted-foreground max-w-xs">
                Planifica tus viajes de forma inteligente con nuestra tecnología de IA. 
                Descubre destinos, itinerarios personalizados y experiencias únicas.
              </p>
              {showSocial && (
                <div className="flex space-x-4">
                  {socialLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <Link
                        key={link.title}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={link.title}
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Navigation links */}
          {showNavigation && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Explorar</h3>
              <ul className="space-y-3">
                {navigationLinks.map((link) => (
                  <li key={link.title}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Mantente informado</h3>
            <p className="text-sm text-muted-foreground">
              Suscríbete a nuestro boletín para recibir las últimas ofertas y destinos.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
              <button
                type="submit"
                className="h-10 px-4 py-2 bg-cta hover:bg-cta-hover text-cta-foreground rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PlanesyGo. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/accessibilidad" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Accesibilidad
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Idioma:</span>
              <select className="h-8 rounded-xl border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Component for a minimal footer
export function MinimalFooter({ className = "" }: { className?: string }) {
  return (
    <footer className={`bg-muted/50 border-t ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <span className="text-sm font-medium">PlanesyGo</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PlanesyGo. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terminos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Términos
            </Link>
            <Link href="/privacidad" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}