import { NextRequest, NextResponse } from 'next/server';
import { scrapeContent, scrapeMultipleContent } from '@/lib/scraper';
import { rateLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { urls, singleUrl } = await request.json();

    // Verificar rate limiting
    const rateLimitResult = await rateLimiter.checkRateLimit('scraping');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too Many Requests',
          message: 'Has excedido el límite de scraping. Por favor, intenta de nuevo más tarde.',
          retryAfter: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    let results;

    if (singleUrl) {
      // Scrapear una sola URL
      if (!isValidUrl(singleUrl)) {
        return NextResponse.json(
          { error: 'URL no válida' },
          { status: 400 }
        );
      }

      results = await scrapeContent(singleUrl);
    } else if (urls && Array.isArray(urls)) {
      // Scrapear múltiples URLs
      const validUrls = urls.filter(isValidUrl);
      
      if (validUrls.length === 0) {
        return NextResponse.json(
          { error: 'No se proporcionaron URLs válidas' },
          { status: 400 }
        );
      }

      // Limitar a 5 URLs para evitar sobrecarga
      const limitedUrls = validUrls.slice(0, 5);
      results = await scrapeMultipleContent(limitedUrls);
    } else {
      return NextResponse.json(
        { error: 'Se requiere una URL (singleUrl) o un array de URLs (urls)' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      results,
      meta: {
        timestamp: new Date().toISOString(),
        remainingRequests: rateLimitResult.remaining,
        urlsCount: Array.isArray(results) ? results.length : 1
      }
    });
  } catch (error) {
    console.error('Error en la API de scraping:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Error en el scraping',
          message: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función para validar URLs
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Endpoint para extraer información específica de una URL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const extract = searchParams.get('extract'); // 'text', 'metadata', 'structured'

    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { error: 'URL no válida o no proporcionada' },
        { status: 400 }
      );
    }

    // Verificar rate limiting
    const rateLimitResult = await rateLimiter.checkRateLimit('scraping');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too Many Requests',
          message: 'Has excedido el límite de scraping. Por favor, intenta de nuevo más tarde.',
          retryAfter: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    const result = await scrapeContent(url);

    // Si se solicita extracción específica
    if (extract === 'text') {
      return NextResponse.json({ 
        url,
        title: result.title,
        content: result.content,
        wordCount: result.wordCount
      });
    } else if (extract === 'metadata') {
      return NextResponse.json({ 
        url,
        title: result.title,
        excerpt: result.excerpt,
        wordCount: result.wordCount
      });
    } else if (extract === 'structured') {
      // Aquí podrías agregar lógica para extraer datos estructurados específicos
      return NextResponse.json({ 
        url,
        title: result.title,
        structuredData: [] // Implementar extracción de datos estructurados
      });
    }

    // Por defecto, devolver todo el resultado
    return NextResponse.json({ 
      result,
      meta: {
        timestamp: new Date().toISOString(),
        remainingRequests: rateLimitResult.remaining
      }
    });
  } catch (error) {
    console.error('Error en el scraping de la URL:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Error al procesar la URL',
          message: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}