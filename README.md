# PlanesyGo - Beta 0.0.1

Genera itinerarios de viaje personalizados con inteligencia artificial.

## Características

- Planificación de viajes personalizada con IA
- Optimización de rutas y presupuesto
- Información meteorológica en tiempo real
- Conversión de divisas actualizada
- Diseño responsivo para todos los dispositivos
- Interfaz intuitiva y fácil de usar

## Requisitos

- Node.js 18.0 o superior
- Cuenta en Vercel para despliegue
- Claves de API para servicios externos (opcional)

## Variables de Entorno

Crea un archivo `.env.local` basado en `.env.local.example` con las siguientes variables:

```
# OpenRouter API Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=qwen/qwen3-next-80b-a3b-thinking

# SerpAPI Configuration
SERPAPI_KEY=your_serpapi_key_here

# Google Maps API Configuration (Optional)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Weather API Configuration (Optional)
WEATHER_API_KEY=your_weather_api_key_here

# Currency API Configuration (Optional)
CURRENCY_API_KEY=your_currency_api_key_here

# Next.js Configuration
NEXTAUTH_URL=https://planesygo.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/planesygo.git
   cd planesygo
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   ```bash
   cp .env.local.example .env.local
   ```
   Edita el archivo `.env.local` con tus claves de API.

## Desarrollo

Para ejecutar la aplicación en modo de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Despliegue en Vercel

1. Crea una cuenta en [Vercel](https://vercel.com) si aún no tienes una.

2. Conecta tu repositorio de GitHub a Vercel.

3. Configura las variables de entorno en el dashboard de Vercel:
   - Ve a la configuración de tu proyecto en Vercel.
   - Selecciona "Environment Variables".
   - Añade todas las variables necesarias del archivo `.env.local`.

4. Despliega la aplicación:
   - Vercel detectará automáticamente que es una aplicación Next.js.
   - El despliegue comenzará automáticamente después de conectar el repositorio.

5. Configura el dominio personalizado (opcional):
   - En la configuración de tu proyecto en Vercel, ve a "Domains".
   - Añade tu dominio personalizado y sigue las instrucciones para configurar el DNS.

## Arquitectura del Proyecto

```
app/
├── api/                 # Rutas de la API
├── dashboard/          # Panel de control del usuario
├── login/              # Página de inicio de sesión
└── page.tsx            # Página principal
components/
├── ui/                 # Componentes de la interfaz de usuario
└── common/             # Componentes comunes
lib/
├── icons.ts           # Iconos de la aplicación
├── copy.ts            # Textos y etiquetas
└── ...                # Utilidades y configuraciones
public/                # Archivos estáticos
```

## Tecnologías Utilizadas

- [Next.js](https://nextjs.org/) - Framework de React
- [Tailwind CSS](https://tailwindcss.com/) - Framework de CSS
- [shadcn/ui](https://ui.shadcn.com/) - Componentes de UI
- [OpenRouter](https://openrouter.ai/) - API para generación de itinerarios
- [SerpAPI](https://serpapi.com/) - API para búsqueda de información
- [Vercel](https://vercel.com/) - Plataforma de despliegue

## Contribuir

1. Haz un fork del repositorio.
2. Crea una rama para tu función (`git checkout -b feature/nueva-funcion`).
3. Confirma tus cambios (`git commit -am 'Añadir nueva función'`).
4. Sube tus cambios (`git push origin feature/nueva-funcion`).
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE](LICENSE) para detalles.

## Soporte

Si tienes algún problema o pregunta, por favor abre un issue en el repositorio de GitHub.