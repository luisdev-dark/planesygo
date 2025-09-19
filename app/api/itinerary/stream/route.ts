import { NextRequest } from 'next/server';
import { searchInfo } from '@/lib/serpapi';
import { scrapeContent } from '@/lib/scraper';
import { generateItinerary } from '@/lib/openrouter';
import { prepareContext } from '@/lib/context-preparer';
import { SSEConnection, createSSEHandler, SSEEvents } from '@/lib/sse';
import { rateLimiter } from '@/lib/rate-limit';
import { securityManager } from '@/lib/security';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('destination');
  const days = searchParams.get('days');
  const budget = searchParams.get('budget');
  const travelStyle = searchParams.get('travelStyle');
  const preferences = searchParams.get('preferences')?.split(',') || [];
  const currency = searchParams.get('currency') || 'USD';

  if (!destination || !days || !budget || !travelStyle) {
    return new Response('Parámetros requeridos: destination, days, budget, travelStyle', { status: 400 });
  }

  return createSSEHandler(async (connection, request) => {
    try {
      // Verificar rate limiting
      const rateLimitResult = await rateLimiter.checkRateLimit('itinerary');
      if (!rateLimitResult.allowed) {
        connection.sendEvent(SSEEvents.ERROR, {
          message: 'Has excedido el límite de generación de itinerarios. Por favor, intenta de nuevo más tarde.',
          retryAfter: rateLimitResult.resetTime
        });
        connection.close();
        return;
      }

      // Enviar evento de inicio
      connection.sendEvent(SSEEvents.ITINERARY_GENERATION_START, {
        message: 'Iniciando generación de itinerario...'
      });

      // 1. Buscar información relevante
      connection.sendEvent(SSEEvents.SEARCH_START, {
        message: `Buscando información sobre ${destination}...`,
        progress: 10
      });

      const searchResults = await searchInfo(destination, preferences);
      
      connection.sendEvent(SSEEvents.SEARCH_COMPLETE, {
        message: `Encontrados ${searchResults.length} resultados relevantes`,
        progress: 25,
        resultsCount: searchResults.length
      });

      // 2. Extraer contenido de las URLs encontradas
      connection.sendEvent(SSEEvents.SCRAPE_START, {
        message: 'Extrayendo contenido de páginas web...',
        progress: 30
      });

      const scrapedContents = await Promise.all(
        searchResults.slice(0, 5).map(async (result, index) => {
          try {
            connection.sendEvent(SSEEvents.SCRAPE_PROGRESS, {
              message: `Procesando página ${index + 1} de ${Math.min(searchResults.length, 5)}...`,
              progress: 30 + (index * 10),
              current: index + 1,
              total: Math.min(searchResults.length, 5)
            });

            // Verificar si podemos scrapear esta URL
            const canScrape = await securityManager.canScrapeUrl(result.link);
            if (!canScrape) {
              console.log(`Scraping no permitido para ${result.link} según robots.txt`);
              return null;
            }

            const content = await scrapeContent(result.link);
            return {
              ...content,
              source: {
                title: result.title,
                url: result.link,
                index: index + 1
              }
            };
          } catch (error) {
            console.error(`Error al scrapear ${result.link}:`, error);
            return null;
          }
        })
      );

      // Filtrar resultados nulos
      const validContents = scrapedContents.filter(content => content !== null);

      connection.sendEvent(SSEEvents.SCRAPE_COMPLETE, {
        message: `Extraído contenido de ${validContents.length} páginas`,
        progress: 60,
        processedCount: validContents.length
      });

      // 3. Preparar el contexto con citas a fuentes
      connection.sendEvent(SSEEvents.ITINERARY_GENERATION_PROGRESS, {
        message: 'Preparando contexto con citas a fuentes...',
        progress: 70
      });

      const preparedContext = prepareContext(validContents, {
        maxLength: 8000,
        includeCitations: true,
        removeDuplicates: true
      });

      connection.sendEvent(SSEEvents.ITINERARY_GENERATION_PROGRESS, {
        message: 'Contexto preparado. Generando itinerario...',
        progress: 80,
        wordCount: preparedContext.wordCount,
        sourcesCount: preparedContext.sources.length
      });

      // 4. Generar itinerario con la información recopilada
      connection.sendEvent(SSEEvents.ITINERARY_GENERATION_PROGRESS, {
        message: 'Generando itinerario con IA...',
        progress: 90
      });

      const itinerary = await generateItinerary({
        destination,
        days: parseInt(days),
        budget: parseInt(budget),
        travelStyle,
        preferences,
        currency,
        context: preparedContext.text,
        sources: preparedContext.sources
      });

      // Enviar resultado final
      connection.sendEvent(SSEEvents.ITINERARY_GENERATION_COMPLETE, {
        message: 'Itinerario generado exitosamente',
        progress: 100,
        itinerary: itinerary.text,
        metadata: {
          destination,
          days: parseInt(days),
          budget: parseInt(budget),
          travelStyle,
          currency,
          sources: preparedContext.sources,
          wordCount: preparedContext.wordCount,
          processingTime: Date.now()
        }
      });

      connection.close();
    } catch (error) {
      console.error('Error en el orquestador de itinerario con SSE:', error);
      connection.sendEvent(SSEEvents.ITINERARY_GENERATION_ERROR, {
        message: 'Error al generar el itinerario',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      connection.close();
    }
  });
}