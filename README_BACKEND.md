# Backend para PlanesyGo

Este backend es el "cerebro" que conecta el dashboard con la IA y con la web. Su rol principal es buscar información real, procesarla y dársela a la IA para que construya un itinerario personalizado y con fuentes confiables.

## Estructura del Backend

```
app/
  api/
    itinerary/route.ts        # Orquestador (Search → Scrape → LLM)
    llm/route.ts              # Proxy sencillo a OpenRouter
    search/route.ts           # Buscador SerpAPI
    scrape/route.ts           # Descarga y extracción de una URL
lib/
  openrouter.ts              # Conexión con OpenRouter (IA)
  serpapi.ts                 # Búsqueda en Google
  scraper.ts                 # Web scraping
  readability.ts             # Extracción de contenido principal
  rate-limit.ts              # Control de tasa de solicitudes
  text.ts                    # Utilidades de texto
  sse.ts                     # Server-Sent Events
types/
  index.ts                   # Definiciones de tipos TypeScript
```

## Instalación de Dependencias

Para que el backend funcione correctamente, necesitas instalar las siguientes dependencias:

```bash
npm install openai serpapi @mozilla/readability jsdom
```

## Configuración de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# OpenRouter API Configuration
OPENROUTER_API_KEY=tu_api_key_de_openrouter_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SerpAPI Configuration
SERPAPI_API_KEY=tu_api_key_de_serpapi_aqui

# App Configuration
NEXT_PUBLIC_APP_NAME="PlanesyGo - Planificador de viajes"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### Obtener API Keys

1. **OpenRouter API Key**:
   - Regístrate en [OpenRouter.ai](https://openrouter.ai/)
   - Genera tu API key en la sección de configuración
   - Añádela a tu archivo `.env.local`

2. **SerpAPI Key**:
   - Regístrate en [SerpAPI.com](https://serpapi.com/)
   - Genera tu API key en el dashboard
   - Añádela a tu archivo `.env.local`

## Endpoints de la API

### 1. Itinerario (`/api/itinerary`)

**Método**: `POST`

**Descripción**: Orquesta el proceso completo de generación de itinerarios:
1. Busca información relevante sobre el destino
2. Extrae contenido de las páginas encontradas
3. Genera un itinerario personalizado con IA

**Cuerpo de la solicitud**:
```json
{
  "destination": "Cancún",
  "days": 5,
  "budget": 2000,
  "travelStyle": "aventura",
  "preferences": ["playas", "ruinas mayas", "gastronomía"]
}
```

**Respuesta**:
```json
{
  "itinerary": "Itinerario generado por la IA..."
}
```

### 2. LLM Chat (`/api/llm`)

**Método**: `POST`

**Descripción**: Proxy para comunicarse con el modelo de IA de OpenRouter

**Cuerpo de la solicitud**:
```json
{
  "message": "¿Cuáles son los mejores restaurantes en Cancún?",
  "context": "Contexto opcional de la conversación anterior"
}
```

**Respuesta**:
```json
{
  "response": "Respuesta generada por la IA..."
}
```

### 3. Búsqueda (`/api/search`)

**Método**: `POST`

**Descripción**: Realiza búsquedas en Google usando SerpAPI

**Tipos de búsqueda**:
- `general`: Búsqueda general de información
- `hotels`: Búsqueda de hoteles
- `flights`: Búsqueda de vuelos

**Cuerpo de la solicitud (búsqueda general)**:
```json
{
  "type": "general",
  "query": {
    "destination": "Cancún",
    "preferences": ["playas", "turismo"]
  }
}
```

**Cuerpo de la solicitud (hoteles)**:
```json
{
  "type": "hotels",
  "query": {},
  "destination": "Cancún",
  "checkIn": "2024-01-15",
  "checkOut": "2024-01-20"
}
```

**Cuerpo de la solicitud (vuelos)**:
```json
{
  "type": "flights",
  "query": {},
  "origin": "LIM",
  "destination": "CUN",
  "departureDate": "2024-01-15",
  "returnDate": "2024-01-20"
}
```

### 4. Scraping (`/api/scrape`)

**Método**: `POST`

**Descripción**: Extrae contenido de páginas web

**Cuerpo de la solicitud (una URL)**:
```json
{
  "singleUrl": "https://ejemplo.com/articulo-turismo"
}
```

**Cuerpo de la solicitud (múltiples URLs)**:
```json
{
  "urls": [
    "https://ejemplo.com/articulo-1",
    "https://ejemplo.com/articulo-2"
  ]
}
```

**Respuesta**:
```json
{
  "results": [
    {
      "title": "Título del artículo",
      "content": "Contenido principal extraído...",
      "excerpt": "Resumen del contenido...",
      "url": "https://ejemplo.com/articulo-1",
      "wordCount": 500
    }
  ]
}
```

## Rate Limiting

El backend implementa control de tasa de solicitudes para evitar sobrecargar las APIs externas:

- **OpenRouter**: 60 solicitudes por minuto
- **SerpAPI**: 100 solicitudes por minuto
- **Scraping**: 20 solicitudes por minuto

Si se excede el límite, la API responderá con un error 429 (Too Many Requests).

## Server-Sent Events (SSE)

El backend soporta comunicación en tiempo real a través de Server-Sent Events. Esto es útil para:

- Mostrar progreso en la generación de itinerarios
- Notificaciones en tiempo real
- Actualizaciones de estado

## Flujo de Trabajo

1. **Búsqueda**: El usuario ingresa sus preferencias y el backend busca información relevante usando SerpAPI
2. **Scraping**: Se extrae el contenido principal de las páginas más relevantes
3. **Procesamiento**: El contenido se limpia y se prepara para la IA
4. **Generación**: La IA (OpenRouter) genera un itinerario personalizado basado en toda la información recopilada
5. **Respuesta**: El itinerario se devuelve al frontend para mostrarlo al usuario

## Manejo de Errores

El backend incluye manejo de errores robusto:

- Validación de parámetros de entrada
- Manejo de errores de APIs externas
- Control de rate limiting
- Logging de errores para depuración

## Seguridad

- Las API keys se almacenan como variables de entorno
- Validación de URLs para evitar accesos no deseados
- Sanitización de contenido extraído
- Control de acceso a través de rate limiting

## Desarrollo

Para iniciar el servidor en modo de desarrollo:

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`