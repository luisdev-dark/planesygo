import { getJson } from 'serpapi';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export async function searchInfo(destination: string, preferences: string[], originCountry?: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERPAPI_KEY || '';
  
  if (!apiKey) {
    throw new Error('SERPAPI_KEY no está configurada');
  }

  try {
    // Construir la consulta de búsqueda basada en el destino y preferencias
    // Utilizando operadores avanzados para mejorar la precisión
    const query = `turismo viajes "${destination}" ${preferences.map(pref => `intitle:${pref}`).join(' OR ')}`;
    
    // Determinar la configuración regional según el país de origen
    const getRegionalConfig = (country: string) => {
      const countryLower = country.toLowerCase();
      
      // Configuraciones regionales para diferentes países
      if (countryLower.includes('perú') || countryLower.includes('peru')) {
        return { hl: 'es', gl: 'pe', location: 'Peru' };
      } else if (countryLower.includes('españ') || countryLower.includes('spain')) {
        return { hl: 'es', gl: 'es', location: 'Spain' };
      } else if (countryLower.includes('méxic') || countryLower.includes('mexico')) {
        return { hl: 'es', gl: 'mx', location: 'Mexico' };
      } else if (countryLower.includes('argentin') || countryLower.includes('argentina')) {
        return { hl: 'es', gl: 'ar', location: 'Argentina' };
      } else if (countryLower.includes('colombi') || countryLower.includes('colombia')) {
        return { hl: 'es', gl: 'co', location: 'Colombia' };
      } else if (countryLower.includes('chin') || countryLower.includes('china')) {
        return { hl: 'zh-cn', gl: 'cn', location: 'China' };
      } else if (countryLower.includes('japón') || countryLower.includes('japon') || countryLower.includes('japan')) {
        return { hl: 'ja', gl: 'jp', location: 'Japan' };
      } else if (countryLower.includes('estados unidos') || countryLower.includes('ee.uu') || countryLower.includes('usa')) {
        return { hl: 'en', gl: 'us', location: 'United States' };
      } else {
        // Configuración por defecto para español
        return { hl: 'es', gl: 'es', location: 'Spain' };
      }
    };
    
    const regionalConfig = originCountry ? getRegionalConfig(originCountry) : { hl: 'es', gl: 'es', location: 'Spain' };
    
    const response = await getJson({
      engine: 'google',
      q: query,
      api_key: apiKey,
      hl: regionalConfig.hl, // Idioma según país de origen
      gl: regionalConfig.gl, // Configuración regional según país de origen
      location: regionalConfig.location, // Ubicación para simular búsquedas reales
      num: 10, // Número de resultados por página
      safe: 'active', // Filtro de contenido para adultos
      filter: '1', // Activar "Resultados Similares"
      no_cache: 'false', // Permitir caché para mejor rendimiento
      output: 'json', // Formato de respuesta JSON
    });

    // Extraer los resultados relevantes
    const results: SearchResult[] = response.organic_results?.map((result: any, index: number) => ({
      title: result.title || '',
      link: result.link || '',
      snippet: result.snippet || '',
      position: index + 1,
    })) || [];

    // También incluir resultados locales si están disponibles
    if (response.local_results) {
      const localResults: SearchResult[] = response.local_results.map((result: any, index: number) => ({
        title: result.title || '',
        link: result.link || result.website || '',
        snippet: result.snippet || result.description || '',
        position: results.length + index + 1,
      }));
      results.push(...localResults);
    }

    // Incluir resultados del Knowledge Graph si están disponibles
    if (response.knowledge_graph) {
      const kgResult: SearchResult = {
        title: response.knowledge_graph.title || '',
        link: response.knowledge_graph.link || '',
        snippet: response.knowledge_graph.description || '',
        position: results.length + 1,
      };
      results.push(kgResult);
    }

    return results.slice(0, 10); // Limitar a 10 resultados para optimizar el procesamiento
  } catch (error) {
    console.error('Error en la búsqueda con SerpAPI:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Error de configuración: La clave de API de SerpAPI no es válida o ha expirado');
      } else if (error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
        throw new Error('Límite de búsquedas alcanzado. Por favor, intenta de nuevo más tarde');
      } else if (error.message.includes('invalid location') || error.message.includes('location')) {
        throw new Error('No se pudo procesar la ubicación especificada. Verifica el nombre del destino');
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet e intenta de nuevo');
      } else {
        throw new Error(`Error al buscar información: ${error.message}`);
      }
    }
    
    throw new Error('Error desconocido al buscar información en la web');
  }
}

export async function searchHotels(destination: string, checkIn: string, checkOut: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERPAPI_KEY || '';
  
  if (!apiKey) {
    throw new Error('SERPAPI_KEY no está configurada');
  }

  try {
    const response = await getJson({
      engine: 'google_hotels',
      q: `hoteles en "${destination}"`,
      api_key: apiKey,
      check_in_date: checkIn,
      check_out_date: checkOut,
      hl: 'es',
      gl: 'es',
      location: 'Spain',
      no_cache: 'false',
      output: 'json',
    });

    const results: SearchResult[] = response.properties?.map((property: any, index: number) => ({
      title: property.name || '',
      link: property.link || property.website || '',
      snippet: `${property.rate?.per_night || 'Precio no disponible'} - ${property.rating || 'Sin calificación'} - ${property.type || ''}`,
      position: index + 1,
    })) || [];

    return results.slice(0, 10); // Limitar a 10 resultados
  } catch (error) {
    console.error('Error en la búsqueda de hoteles:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Error de configuración: La clave de API de SerpAPI no es válida o ha expirado');
      } else if (error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
        throw new Error('Límite de búsquedas alcanzado. Por favor, intenta de nuevo más tarde');
      } else if (error.message.includes('invalid location') || error.message.includes('location')) {
        throw new Error('No se pudo procesar la ubicación especificada. Verifica el nombre del destino');
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet e intenta de nuevo');
      } else {
        throw new Error(`Error al buscar hoteles: ${error.message}`);
      }
    }
    
    throw new Error('Error desconocido al buscar hoteles');
  }
}

export async function searchFlights(origin: string, destination: string, departureDate: string, returnDate?: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERPAPI_KEY || '';
  
  if (!apiKey) {
    throw new Error('SERPAPI_KEY no está configurada');
  }

  try {
    const params: any = {
      engine: 'google_flights',
      q: `vuelos de "${origin}" a "${destination}"`,
      api_key: apiKey,
      departure_date: departureDate,
      hl: 'es',
      gl: 'es',
      location: 'Spain',
      no_cache: 'false',
      output: 'json',
    };

    if (returnDate) {
      params.return_date = returnDate;
    }

    const response = await getJson(params);

    const results: SearchResult[] = response.best_flights?.map((flight: any, index: number) => ({
      title: `${flight.airlines?.join(', ') || 'Aerolínea no especificada'} - ${flight.duration || 'Duración no disponible'}`,
      link: flight.booking_link || '',
      snippet: `Precio: ${flight.price || 'No disponible'} - Escalas: ${flight.stops || 0}`,
      position: index + 1,
    })) || [];

    return results.slice(0, 10); // Limitar a 10 resultados
  } catch (error) {
    console.error('Error en la búsqueda de vuelos:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Error de configuración: La clave de API de SerpAPI no es válida o ha expirado');
      } else if (error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
        throw new Error('Límite de búsquedas alcanzado. Por favor, intenta de nuevo más tarde');
      } else if (error.message.includes('invalid location') || error.message.includes('location')) {
        throw new Error('No se pudo procesar la ubicación especificada. Verifica el nombre del destino');
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet e intenta de nuevo');
      } else {
        throw new Error(`Error al buscar vuelos: ${error.message}`);
      }
    }
    
    throw new Error('Error desconocido al buscar vuelos');
  }
}

// Nueva función para buscar actividades y atracciones turísticas
export async function searchActivities(destination: string, preferences: string[], originCountry?: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERPAPI_KEY || '';
  
  if (!apiKey) {
    throw new Error('SERPAPI_KEY no está configurada');
  }

  try {
    // Construir consulta específica para actividades turísticas
    const query = `actividades turísticas atracciones "${destination}" ${preferences.map(pref => `intitle:${pref}`).join(' OR ')}`;
    
    // Determinar la configuración regional según el país de origen
    const getRegionalConfig = (country: string) => {
      const countryLower = country.toLowerCase();
      
      // Configuraciones regionales para diferentes países
      if (countryLower.includes('perú') || countryLower.includes('peru')) {
        return { hl: 'es', gl: 'pe', location: 'Peru' };
      } else if (countryLower.includes('españ') || countryLower.includes('spain')) {
        return { hl: 'es', gl: 'es', location: 'Spain' };
      } else if (countryLower.includes('méxic') || countryLower.includes('mexico')) {
        return { hl: 'es', gl: 'mx', location: 'Mexico' };
      } else if (countryLower.includes('argentin') || countryLower.includes('argentina')) {
        return { hl: 'es', gl: 'ar', location: 'Argentina' };
      } else if (countryLower.includes('colombi') || countryLower.includes('colombia')) {
        return { hl: 'es', gl: 'co', location: 'Colombia' };
      } else if (countryLower.includes('chin') || countryLower.includes('china')) {
        return { hl: 'zh-cn', gl: 'cn', location: 'China' };
      } else if (countryLower.includes('japón') || countryLower.includes('japon') || countryLower.includes('japan')) {
        return { hl: 'ja', gl: 'jp', location: 'Japan' };
      } else if (countryLower.includes('estados unidos') || countryLower.includes('ee.uu') || countryLower.includes('usa')) {
        return { hl: 'en', gl: 'us', location: 'United States' };
      } else {
        // Configuración por defecto para español
        return { hl: 'es', gl: 'es', location: 'Spain' };
      }
    };
    
    const regionalConfig = originCountry ? getRegionalConfig(originCountry) : { hl: 'es', gl: 'es', location: 'Spain' };
    
    const response = await getJson({
      engine: 'google',
      q: query,
      api_key: apiKey,
      hl: regionalConfig.hl,
      gl: regionalConfig.gl,
      location: regionalConfig.location,
      tbm: 'lcl', // Búsqueda local
      num: 10,
      safe: 'active',
      filter: '1',
      no_cache: 'false',
      output: 'json',
    });

    const results: SearchResult[] = [];

    // Procesar resultados orgánicos
    if (response.organic_results) {
      const organicResults: SearchResult[] = response.organic_results.map((result: any, index: number) => ({
        title: result.title || '',
        link: result.link || '',
        snippet: result.snippet || '',
        position: index + 1,
      }));
      results.push(...organicResults);
    }

    // Procesar resultados locales
    if (response.local_results) {
      const localResults: SearchResult[] = response.local_results.map((result: any, index: number) => ({
        title: result.title || '',
        link: result.link || result.website || '',
        snippet: result.snippet || result.description || '',
        position: results.length + index + 1,
      }));
      results.push(...localResults);
    }

    // Procesar resultados de Places si están disponibles
    if (response.places_results) {
      const placesResults: SearchResult[] = response.places_results.map((result: any, index: number) => ({
        title: result.title || result.name || '',
        link: result.link || result.website || result.data_cid ? `https://maps.google.com/?cid=${result.data_cid}` : '',
        snippet: result.snippet || result.description || result.type || '',
        position: results.length + index + 1,
      }));
      results.push(...placesResults);
    }

    return results.slice(0, 15); // Permitir más resultados para actividades
  } catch (error) {
    console.error('Error en la búsqueda de actividades:', error);
    throw new Error('Error al buscar actividades turísticas');
  }
}

// Nueva función para buscar restaurantes y gastronomía local
export async function searchRestaurants(destination: string, preferences: string[], originCountry?: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERPAPI_KEY || '';
  
  if (!apiKey) {
    throw new Error('SERPAPI_KEY no está configurada');
  }

  try {
    // Construir consulta específica para restaurantes
    const query = `restaurantes gastronomía "${destination}" ${preferences.map(pref => `intitle:${pref}`).join(' OR ')}`;
    
    // Determinar la configuración regional según el país de origen
    const getRegionalConfig = (country: string) => {
      const countryLower = country.toLowerCase();
      
      // Configuraciones regionales para diferentes países
      if (countryLower.includes('perú') || countryLower.includes('peru')) {
        return { hl: 'es', gl: 'pe', location: 'Peru' };
      } else if (countryLower.includes('españ') || countryLower.includes('spain')) {
        return { hl: 'es', gl: 'es', location: 'Spain' };
      } else if (countryLower.includes('méxic') || countryLower.includes('mexico')) {
        return { hl: 'es', gl: 'mx', location: 'Mexico' };
      } else if (countryLower.includes('argentin') || countryLower.includes('argentina')) {
        return { hl: 'es', gl: 'ar', location: 'Argentina' };
      } else if (countryLower.includes('colombi') || countryLower.includes('colombia')) {
        return { hl: 'es', gl: 'co', location: 'Colombia' };
      } else if (countryLower.includes('chin') || countryLower.includes('china')) {
        return { hl: 'zh-cn', gl: 'cn', location: 'China' };
      } else if (countryLower.includes('japón') || countryLower.includes('japon') || countryLower.includes('japan')) {
        return { hl: 'ja', gl: 'jp', location: 'Japan' };
      } else if (countryLower.includes('estados unidos') || countryLower.includes('ee.uu') || countryLower.includes('usa')) {
        return { hl: 'en', gl: 'us', location: 'United States' };
      } else {
        // Configuración por defecto para español
        return { hl: 'es', gl: 'es', location: 'Spain' };
      }
    };
    
    const regionalConfig = originCountry ? getRegionalConfig(originCountry) : { hl: 'es', gl: 'es', location: 'Spain' };
    
    const response = await getJson({
      engine: 'google',
      q: query,
      api_key: apiKey,
      hl: regionalConfig.hl,
      gl: regionalConfig.gl,
      location: regionalConfig.location,
      tbm: 'lcl', // Búsqueda local
      num: 10,
      safe: 'active',
      filter: '1',
      no_cache: 'false',
      output: 'json',
    });

    const results: SearchResult[] = [];

    // Procesar resultados orgánicos
    if (response.organic_results) {
      const organicResults: SearchResult[] = response.organic_results.map((result: any, index: number) => ({
        title: result.title || '',
        link: result.link || '',
        snippet: result.snippet || '',
        position: index + 1,
      }));
      results.push(...organicResults);
    }

    // Procesar resultados locales
    if (response.local_results) {
      const localResults: SearchResult[] = response.local_results.map((result: any, index: number) => ({
        title: result.title || '',
        link: result.link || result.website || '',
        snippet: result.snippet || result.description || `${result.rating || ''} ${result.reviews || ''}`,
        position: results.length + index + 1,
      }));
      results.push(...localResults);
    }

    // Procesar resultados de Places si están disponibles
    if (response.places_results) {
      const placesResults: SearchResult[] = response.places_results.map((result: any, index: number) => ({
        title: result.title || result.name || '',
        link: result.link || result.website || result.data_cid ? `https://maps.google.com/?cid=${result.data_cid}` : '',
        snippet: result.snippet || result.description || result.type || `${result.rating || ''} ${result.reviews || ''}`,
        position: results.length + index + 1,
      }));
      results.push(...placesResults);
    }

    return results.slice(0, 15); // Permitir más resultados para restaurantes
  } catch (error) {
    console.error('Error en la búsqueda de restaurantes:', error);
    throw new Error('Error al buscar restaurantes');
  }
}

// Nueva función para buscar blogs de viajes y experiencias personales
export async function searchBlogs(destination: string, preferences: string[], originCountry?: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERPAPI_KEY || '';
  
  if (!apiKey) {
    throw new Error('SERPAPI_KEY no está configurada');
  }

  try {
    // Construir consulta específica para blogs de viajes y experiencias personales
    // Utilizamos operadores de búsqueda específicos para encontrar blogs y experiencias personales
    const query = `blog viaje experiencia personal "${destination}" ${preferences.map(pref => `intitle:${pref}`).join(' OR ')} site:blog.com OR site:wordpress.com OR site:blogger.com OR site:medium.com OR site:travelblog.org OR inurl:blog OR inurl:diario-viaje OR inurl:mi-viaje`;
    
    // Determinar la configuración regional según el país de origen
    const getRegionalConfig = (country: string) => {
      const countryLower = country.toLowerCase();
      
      // Configuraciones regionales para diferentes países
      if (countryLower.includes('perú') || countryLower.includes('peru')) {
        return { hl: 'es', gl: 'pe', location: 'Peru' };
      } else if (countryLower.includes('españ') || countryLower.includes('spain')) {
        return { hl: 'es', gl: 'es', location: 'Spain' };
      } else if (countryLower.includes('méxic') || countryLower.includes('mexico')) {
        return { hl: 'es', gl: 'mx', location: 'Mexico' };
      } else if (countryLower.includes('argentin') || countryLower.includes('argentina')) {
        return { hl: 'es', gl: 'ar', location: 'Argentina' };
      } else if (countryLower.includes('colombi') || countryLower.includes('colombia')) {
        return { hl: 'es', gl: 'co', location: 'Colombia' };
      } else if (countryLower.includes('chin') || countryLower.includes('china')) {
        return { hl: 'zh-cn', gl: 'cn', location: 'China' };
      } else if (countryLower.includes('japón') || countryLower.includes('japon') || countryLower.includes('japan')) {
        return { hl: 'ja', gl: 'jp', location: 'Japan' };
      } else if (countryLower.includes('estados unidos') || countryLower.includes('ee.uu') || countryLower.includes('usa')) {
        return { hl: 'en', gl: 'us', location: 'United States' };
      } else {
        // Configuración por defecto para español
        return { hl: 'es', gl: 'es', location: 'Spain' };
      }
    };
    
    const regionalConfig = originCountry ? getRegionalConfig(originCountry) : { hl: 'es', gl: 'es', location: 'Spain' };
    
    const response = await getJson({
      engine: 'google',
      q: query,
      api_key: apiKey,
      hl: regionalConfig.hl,
      gl: regionalConfig.gl,
      location: regionalConfig.location,
      tbs: 'qdr:y', // Resultados del último año para obtener contenido fresco
      num: 15, // Aumentar el número de resultados para blogs
      safe: 'active',
      filter: '1',
      no_cache: 'false',
      output: 'json',
    });

    const results: SearchResult[] = [];

    // Procesar resultados orgánicos
    if (response.organic_results) {
      const organicResults: SearchResult[] = response.organic_results.map((result: any, index: number) => ({
        title: result.title || '',
        link: result.link || '',
        snippet: result.snippet || '',
        position: index + 1,
      }));
      results.push(...organicResults);
    }

    // Procesar resultados de blogs si están disponibles
    if (response.blog_results) {
      const blogResults: SearchResult[] = response.blog_results.map((result: any, index: number) => ({
        title: result.title || '',
        link: result.link || result.url || '',
        snippet: result.snippet || result.description || '',
        position: results.length + index + 1,
      }));
      results.push(...blogResults);
    }

    return results.slice(0, 20); // Permitir más resultados para blogs
  } catch (error) {
    console.error('Error en la búsqueda de blogs:', error);
    throw new Error('Error al buscar blogs de viajes');
  }
}

// Nueva función para buscar reseñas y opiniones de viajeros
export async function searchReviews(destination: string, preferences: string[], originCountry?: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERPAPI_KEY || '';
  
  if (!apiKey) {
    throw new Error('SERPAPI_KEY no está configurada');
  }

  try {
    // Construir consulta específica para reseñas y opiniones de viajeros
    // Utilizamos operadores de búsqueda específicos para encontrar reseñas y opiniones
    const query = `resena opinión review "${destination}" ${preferences.map(pref => `intitle:${pref}`).join(' OR ')} site:tripadvisor.com OR site:booking.com OR site:expedia.com OR site:airbnb.com OR site:google.com/travel OR inurl:review OR inurl:opinion OR inurl:resena`;
    
    // Determinar la configuración regional según el país de origen
    const getRegionalConfig = (country: string) => {
      const countryLower = country.toLowerCase();
      
      // Configuraciones regionales para diferentes países
      if (countryLower.includes('perú') || countryLower.includes('peru')) {
        return { hl: 'es', gl: 'pe', location: 'Peru' };
      } else if (countryLower.includes('españ') || countryLower.includes('spain')) {
        return { hl: 'es', gl: 'es', location: 'Spain' };
      } else if (countryLower.includes('méxic') || countryLower.includes('mexico')) {
        return { hl: 'es', gl: 'mx', location: 'Mexico' };
      } else if (countryLower.includes('argentin') || countryLower.includes('argentina')) {
        return { hl: 'es', gl: 'ar', location: 'Argentina' };
      } else if (countryLower.includes('colombi') || countryLower.includes('colombia')) {
        return { hl: 'es', gl: 'co', location: 'Colombia' };
      } else if (countryLower.includes('chin') || countryLower.includes('china')) {
        return { hl: 'zh-cn', gl: 'cn', location: 'China' };
      } else if (countryLower.includes('japón') || countryLower.includes('japon') || countryLower.includes('japan')) {
        return { hl: 'ja', gl: 'jp', location: 'Japan' };
      } else if (countryLower.includes('estados unidos') || countryLower.includes('ee.uu') || countryLower.includes('usa')) {
        return { hl: 'en', gl: 'us', location: 'United States' };
      } else {
        // Configuración por defecto para español
        return { hl: 'es', gl: 'es', location: 'Spain' };
      }
    };
    
    const regionalConfig = originCountry ? getRegionalConfig(originCountry) : { hl: 'es', gl: 'es', location: 'Spain' };
    
    const response = await getJson({
      engine: 'google',
      q: query,
      api_key: apiKey,
      hl: regionalConfig.hl,
      gl: regionalConfig.gl,
      location: regionalConfig.location,
      tbs: 'qdr:y', // Resultados del último año para obtener contenido fresco
      num: 15, // Aumentar el número de resultados para reseñas
      safe: 'active',
      filter: '1',
      no_cache: 'false',
      output: 'json',
    });

    const results: SearchResult[] = [];

    // Procesar resultados orgánicos
    if (response.organic_results) {
      const organicResults: SearchResult[] = response.organic_results.map((result: any, index: number) => ({
        title: result.title || '',
        link: result.link || '',
        snippet: result.snippet || '',
        position: index + 1,
      }));
      results.push(...organicResults);
    }

    // Procesar resultados de reseñas si están disponibles
    if (response.reviews_results) {
      const reviewsResults: SearchResult[] = response.reviews_results.map((result: any, index: number) => ({
        title: result.title || '',
        link: result.link || result.url || '',
        snippet: result.snippet || result.description || '',
        position: results.length + index + 1,
      }));
      results.push(...reviewsResults);
    }

    return results.slice(0, 20); // Permitir más resultados para reseñas
  } catch (error) {
    console.error('Error en la búsqueda de reseñas:', error);
    throw new Error('Error al buscar reseñas de viajes');
  }
}