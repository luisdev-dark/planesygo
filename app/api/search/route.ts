import { NextRequest, NextResponse } from 'next/server';
import { searchInfo, searchHotels, searchFlights } from '@/lib/serpapi';
import { rateLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { query, type, ...params } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'La consulta de búsqueda es requerida' },
        { status: 400 }
      );
    }

    // Verificar rate limiting
    const rateLimitResult = await rateLimiter.checkRateLimit('serpapi');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too Many Requests',
          message: 'Has excedido el límite de búsquedas. Por favor, intenta de nuevo más tarde.',
          retryAfter: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    let results;

    switch (type) {
      case 'general':
        results = await searchInfo(query.destination || query, query.preferences || []);
        break;
      
      case 'hotels':
        if (!params.destination || !params.checkIn || !params.checkOut) {
          return NextResponse.json(
            { error: 'Para buscar hoteles se requiere: destination, checkIn, checkOut' },
            { status: 400 }
          );
        }
        results = await searchHotels(params.destination, params.checkIn, params.checkOut);
        break;
      
      case 'flights':
        if (!params.origin || !params.destination || !params.departureDate) {
          return NextResponse.json(
            { error: 'Para buscar vuelos se requiere: origin, destination, departureDate' },
            { status: 400 }
          );
        }
        results = await searchFlights(
          params.origin, 
          params.destination, 
          params.departureDate, 
          params.returnDate
        );
        break;
      
      default:
        return NextResponse.json(
          { error: 'Tipo de búsqueda no válido. Use: general, hotels, flights' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      results,
      meta: {
        type,
        query,
        timestamp: new Date().toISOString(),
        remainingRequests: rateLimitResult.remaining
      }
    });
  } catch (error) {
    console.error('Error en la API de búsqueda:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Error en la búsqueda',
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

// Endpoint para obtener sugerencias de búsqueda
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'La consulta debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }

    // Sugerencias simples basadas en la consulta
    const suggestions = [
      `Mejores lugares para visitar en ${query}`,
      `Restaurantes recomendados en ${query}`,
      `Hoteles en ${query}`,
      `Actividades turísticas en ${query}`,
      `Guía de viaje para ${query}`
    ];

    return NextResponse.json({ 
      suggestions,
      query 
    });
  } catch (error) {
    console.error('Error al obtener sugerencias:', error);
    return NextResponse.json(
      { error: 'Error al obtener sugerencias' },
      { status: 500 }
    );
  }
}