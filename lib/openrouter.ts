import OpenAI from 'openai';
import { createItineraryPrompt, createChatPrompt, ItineraryPromptOptions } from './prompts';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'PlanesyGo - Planificador de viajes',
  },
});

export interface ItineraryParams {
  originCountry?: string;
  destination: string;
  days: number;
  budget: number;
  travelStyle: string;
  preferences: string[];
  context: string;
  currency?: string;
  sources?: any[];
}

export async function generateItinerary(params: ItineraryParams): Promise<{ text: string; sources?: any[] }> {
  const { originCountry, destination, days, budget, travelStyle, preferences, context, currency = 'USD', sources } = params;

  const promptOptions: ItineraryPromptOptions = {
    originCountry,
    destination,
    days,
    budget,
    currency,
    travelStyle,
    preferences,
    context,
    sources,
    includePrices: true,
    includeWeather: true,
    includeTransport: true,
    includeFood: true
  };

  const prompt = createItineraryPrompt(promptOptions);

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-5-chat', // Usar variable de entorno o modelo por defecto
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente experto en planificación de viajes con años de experiencia. Creas itinerarios personalizados y detallados con información específica sobre lugares, horarios, costos y consejos prácticos. Utiliza las fuentes proporcionadas para citar información específica y siempre proporciona detalles concretos y útiles para el viajero.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5, // Menos temperatura para respuestas más consistentes
      max_tokens: 16000, // Aumentado significativamente para itinerarios más largos y detallados
    });

    const itineraryText = completion.choices[0].message.content;
    
    // Verificar si se generó un itinerario válido
    if (!itineraryText || itineraryText.trim().length < 300) {
      console.error('El itinerario generado es demasiado corto o vacío:', itineraryText);
      throw new Error('El itinerario generado es demasiado corto o incompleto');
    }
    
    // Verificar que el itinerario no sea el mensaje de error genérico
    if (itineraryText.includes('Lo sentimos, no hemos podido generar un itinerario detallado')) {
      console.error('El itinerario generado contiene el mensaje de error genérico');
      throw new Error('El itinerario generado contiene el mensaje de error genérico');
    }
    
    return {
      text: itineraryText,
      sources
    };
  } catch (error) {
    console.error('Error al generar itinerario con OpenRouter:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        throw new Error('Error de configuración: La clave de API de OpenRouter no es válida o ha expirado');
      } else if (error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
        throw new Error('Límite de solicitudes a la IA alcanzado. Por favor, intenta de nuevo más tarde');
      } else if (error.message.includes('timeout')) {
        throw new Error('La solicitud a la IA ha excedido el tiempo límite. Por favor, intenta de nuevo');
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        throw new Error('Error de conexión con el servicio de IA. Verifica tu conexión a internet');
      } else if (error.message.includes('insufficient credits') || error.message.includes('billing')) {
        throw new Error('Créditos insuficientes en la cuenta de OpenRouter. Verifica tu suscripción');
      } else if (error.message.includes('model') || error.message.includes('not found')) {
        throw new Error('El modelo de IA no está disponible temporalmente. Por favor, intenta de nuevo más tarde');
      } else {
        throw new Error(`Error al generar itinerario con IA: ${error.message}`);
      }
    }
    
    throw new Error('Error desconocido al generar el itinerario con IA');
  }
}

export async function chatWithAssistant(message: string, context?: string, history?: Array<{role: string, content: string}>): Promise<string> {
  try {
    const prompt = createChatPrompt(message, context, history);

    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-5-chat',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content || 'No se pudo generar una respuesta.';
  } catch (error) {
    console.error('Error en el chat con el asistente:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        throw new Error('Error de configuración: La clave de API de OpenRouter no es válida o ha expirado');
      } else if (error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
        throw new Error('Límite de solicitudes a la IA alcanzado. Por favor, intenta de nuevo más tarde');
      } else if (error.message.includes('timeout')) {
        throw new Error('La solicitud a la IA ha excedido el tiempo límite. Por favor, intenta de nuevo');
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        throw new Error('Error de conexión con el servicio de IA. Verifica tu conexión a internet');
      } else if (error.message.includes('insufficient credits') || error.message.includes('billing')) {
        throw new Error('Créditos insuficientes en la cuenta de OpenRouter. Verifica tu suscripción');
      } else if (error.message.includes('model') || error.message.includes('not found')) {
        throw new Error('El modelo de IA no está disponible temporalmente. Por favor, intenta de nuevo más tarde');
      } else {
        throw new Error(`Error al comunicarse con el asistente de IA: ${error.message}`);
      }
    }
    
    throw new Error('Error desconocido al comunicarse con el asistente de IA');
  }
}