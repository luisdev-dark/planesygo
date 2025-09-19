import { NextRequest, NextResponse } from 'next/server';
import { searchInfo, searchActivities, searchRestaurants, searchBlogs, searchReviews, SearchResult } from '@/lib/serpapi';
import { scrapeContent, scrapeWithFallback } from '@/lib/scraper';
import { generateItinerary } from '@/lib/openrouter';
import { prepareContext } from '@/lib/context-preparer';
import { rateLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { preferences, originCountry, destination, days, budget, travelStyle, currency = 'USD' } = await request.json();

    // Validar datos de entrada
    if (!destination || !days || !budget || !travelStyle) {
      return NextResponse.json(
        {
          error: 'Datos incompletos',
          message: 'Faltan datos requeridos para generar el itinerario'
        },
        { status: 400 }
      );
    }

    // Verificar rate limiting
    try {
      const rateLimitResult = await rateLimiter.checkRateLimit('itinerary');
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          {
            error: 'Too Many Requests',
            message: 'Has excedido el límite de generación de itinerarios. Por favor, intenta de nuevo más tarde.',
            retryAfter: rateLimitResult.resetTime
          },
          { status: 429 }
        );
      }
    } catch (rateLimitError) {
      console.error('Error en el rate limiting:', rateLimitError);
      // Continuar aunque falle el rate limiting
    }

    console.log('Iniciando generación de itinerario para:', destination, 'desde:', originCountry);

    // 1. Buscar información general sobre el destino
    console.log('Buscando información general sobre', destination);
    let generalInfo: SearchResult[] = [];
    try {
      generalInfo = await searchInfo(destination, preferences, originCountry);
    } catch (error) {
      console.error('Error al buscar información general:', error);
      // Continuar con información vacía si falla la búsqueda
    }
    
    // 2. Buscar actividades y atracciones específicas
    console.log('Buscando actividades y atracciones en', destination);
    let activitiesInfo: SearchResult[] = [];
    try {
      activitiesInfo = await searchActivities(destination, preferences, originCountry);
    } catch (error) {
      console.error('Error al buscar actividades:', error);
      // Continuar con información vacía si falla la búsqueda
    }
    
    // 3. Buscar restaurantes y opciones gastronómicas
    console.log('Buscando restaurantes en', destination);
    let restaurantsInfo: SearchResult[] = [];
    try {
      restaurantsInfo = await searchRestaurants(destination, preferences, originCountry);
    } catch (error) {
      console.error('Error al buscar restaurantes:', error);
      // Continuar con información vacía si falla la búsqueda
    }
    
    // 4. Buscar blogs de viajes y experiencias personales (NUEVO)
    console.log('Buscando blogs de viajes sobre', destination);
    let blogsInfo: SearchResult[] = [];
    try {
      blogsInfo = await searchBlogs(destination, preferences, originCountry);
    } catch (error) {
      console.error('Error al buscar blogs:', error);
      // Continuar con información vacía si falla la búsqueda
    }
    
    // 5. Buscar reseñas y opiniones de viajeros (NUEVO)
    console.log('Buscando reseñas de viajes sobre', destination);
    let reviewsInfo: SearchResult[] = [];
    try {
      reviewsInfo = await searchReviews(destination, preferences, originCountry);
    } catch (error) {
      console.error('Error al buscar reseñas:', error);
      // Continuar con información vacía si falla la búsqueda
    }
    
    // Combinar todos los resultados de búsqueda y eliminar duplicados basados en URLs
    const uniqueUrls = new Set();
    const allSearchResults = [...generalInfo, ...activitiesInfo, ...restaurantsInfo, ...blogsInfo, ...reviewsInfo].filter(result => {
      if (uniqueUrls.has(result.link)) {
        return false;
      }
      uniqueUrls.add(result.link);
      return true;
    });
    console.log(`Total de resultados de búsqueda únicos: ${allSearchResults.length}`);
    
    // 6. Extraer contenido de las URLs encontradas (aumentado a 15 para más información)
    console.log('Extrayendo contenido de', Math.min(allSearchResults.length, 15), 'páginas');
    const scrapedContents = await Promise.allSettled(
      allSearchResults.slice(0, 15).map(async (result, index) => {
        try {
          // Usar la nueva función scrapeWithFallback que incluye un plan B
          const content = await scrapeWithFallback(result.link, result);
          return {
            ...content,
            source: {
              title: result.title,
              url: result.link,
              index: index + 1
            }
          };
        } catch (error) {
          console.error(`Error al scrapear ${result.link} incluso con fallback:`, error);
          // Último recurso: usar solo la información del resultado de búsqueda
          return {
            content: `${result.title}\n\n${result.snippet || ''}`,
            title: result.title,
            source: {
              title: result.title,
              url: result.link,
              index: index + 1
            }
          };
        }
      })
    );

    // Procesar resultados y filtrar solo los válidos
    const validContents = scrapedContents
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any>).value);
    
    console.log(`Contenido válido extraído de ${validContents.length} fuentes`);
    
    // 5. Preparar el contexto con citas a fuentes
    console.log('Preparando contexto con citas a fuentes');
    const preparedContext = prepareContext(validContents, {
      maxLength: 12000, // Aumentado para proporcionar más contexto a la IA
      includeCitations: true,
      removeDuplicates: true
    });
    
    console.log(`Contexto preparado: ${preparedContext.wordCount} palabras, ${preparedContext.sources.length} fuentes`);
    
    // Si el contexto es demasiado pequeño, añadir información básica del destino
    if (preparedContext.wordCount < 500) {
      console.log('Contexto demasiado pequeño, añadiendo información básica');
      const basicInfo = `
# Información básica sobre ${destination}

${destination} es un destino turístico popular con una rica historia, cultura y atracciones.
Para un viaje de ${days} días con un presupuesto de ${budget} ${currency} y un estilo de viaje ${travelStyle},
se recomienda planificar visitas a los principales puntos de interés, disfrutar de la gastronomía local
y experimentar las actividades únicas que ofrece este destino.

## Lugares de interés común
- Sitios históricos y culturales
- Museos y galerías de arte
- Parques y áreas naturales
- Mercados locales y zonas comerciales
- Restaurantes con gastronomía típica

## Consejos generales
- Investigar el clima y empacar ropa adecuada
- Aprender frases básicas del idioma local
- Respetar las costumbres y tradiciones locales
- Llevar efectivo y tarjetas de crédito
- Contratar un seguro de viaje
`;
      
      preparedContext.text += basicInfo;
      preparedContext.wordCount += basicInfo.split(' ').length;
      console.log(`Contexto ampliado: ${preparedContext.wordCount} palabras`);
    }
    
    // 6. Generar itinerario con la información recopilada
    console.log('Generando itinerario con IA');
    let itinerary;
    try {
      itinerary = await generateItinerary({
        originCountry,
        destination,
        days,
        budget,
        travelStyle,
        preferences,
        currency,
        context: preparedContext.text,
        sources: preparedContext.sources
      });
      console.log('Itinerario generado exitosamente');
    } catch (error) {
      console.error('Error al generar el itinerario:', error);
      
      // Si falla la generación con IA, crear un itinerario básico con información útil
      itinerary = {
        text: `# Itinerario para ${destination}

Hemos encontrado algunas dificultades para generar un itinerario completo, pero aquí tienes una guía básica para tu viaje:

## Información básica
- **Destino:** ${destination}
- **Duración:** ${days} días
- **Presupuesto:** ${budget} ${currency}
- **Estilo de viaje:** ${travelStyle}

## Sugerencias para planificar tu viaje

### Día 1: Llegada y aclimatación
- **Mañana:** Llegada al destino y check-in en el alojamiento
- **Tarde:** Exploración del área circundante al hotel
- **Noche:** Cena en un restaurante local cercano

### Día 2: Exploración principal
- **Mañana:** Visita al punto turístico principal de ${destination}
- **Tarde:** Exploración de museos o atracciones culturales
- **Noche:** Experiencia gastronómica local

### Día 3: Actividades opcionales
- **Mañana:** Tiempo libre para actividades según tus preferencias: ${preferences.join(', ')}
- **Tarde:** Compras de souvenirs o productos locales
- **Noche:** Preparación para la partida

### Lugares recomendados para investigar:
1. Los principales monumentos y atracciones turísticas de ${destination}
2. Museos y centros culturales importantes
3. Parques naturales o áreas de esparcimiento
4. Restaurantes con gastronomía típica
5. Mercados locales para体验 la cultura auténtica

### Consejos prácticos:
- Investiga el clima para saber qué ropa empacar
- Aprende algunas frases básicas del idioma local
- Verifica si necesitas visas o requisitos de entrada
- Considera comprar un seguro de viaje
- Investiga opciones de transporte local

Te recomendamos intentar generar el itinerario nuevamente más tarde para obtener una planificación más detallada.`,
        sources: preparedContext.sources
      };
    }

    return NextResponse.json({
      itinerary: itinerary.text,
      metadata: {
        originCountry,
        destination,
        days,
        budget,
        travelStyle,
        sources: preparedContext.sources,
        wordCount: preparedContext.wordCount,
        processingTime: Date.now(),
        searchResultsCount: allSearchResults.length,
        scrapedSourcesCount: validContents.length
      }
    });
  } catch (error) {
    console.error('Error en el orquestador de itinerario:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorDetails = {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    };
    
    // Si el error es un timeout (504), devolver un mensaje más específico
    if (errorMessage.includes('timeout') || errorMessage.includes('504')) {
      return NextResponse.json(
        {
          error: 'Tiempo de espera agotado',
          details: 'La solicitud está tardando más de lo esperado. Por favor, intenta de nuevo más tarde o reduce la cantidad de información a procesar.',
          suggestion: 'Intenta con un destino más específico o menos días de viaje.'
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      {
        error: 'Error al generar el itinerario',
        details: errorMessage,
        debug: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}

// Endpoint para generación de itinerario con actualizaciones en tiempo real (SSE)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('destination');
  const days = searchParams.get('days');
  const budget = searchParams.get('budget');
  const travelStyle = searchParams.get('travelStyle');
  const preferences = searchParams.get('preferences')?.split(',') || [];

  if (!destination || !days || !budget || !travelStyle) {
    return new Response('Parámetros requeridos: destination, days, budget, travelStyle', { status: 400 });
  }

  // Aquí implementaríamos la lógica para SSE
  // Por ahora, devolvemos un error indicando que esta funcionalidad está en desarrollo
  return new Response('Esta funcionalidad está en desarrollo', { status: 501 });
}