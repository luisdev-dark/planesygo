// Utilidades para Server-Sent Events (SSE)

export interface SSEMessage {
  event?: string;
  data: any;
  id?: string;
  retry?: number;
}

export class SSEConnection {
  private response: any;
  private encoder: TextEncoder;

  constructor(response: any) {
    this.response = response;
    this.encoder = new TextEncoder();
    
    // Configurar headers para SSE
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
  }

  send(message: SSEMessage): void {
    let data = '';
    
    if (message.event) {
      data += `event: ${message.event}\n`;
    }
    
    if (message.id) {
      data += `id: ${message.id}\n`;
    }
    
    if (message.retry) {
      data += `retry: ${message.retry}\n`;
    }
    
    // Formatear los datos - cada línea debe empezar con "data: "
    const messageData = typeof message.data === 'string' 
      ? message.data 
      : JSON.stringify(message.data);
    
    data += `data: ${messageData}\n\n`;
    
    this.response.write(this.encoder.encode(data));
  }

  sendEvent(event: string, data: any, id?: string): void {
    this.send({ event, data, id });
  }

  sendData(data: any): void {
    this.send({ data });
  }

  sendError(error: string | Error): void {
    const errorMessage = error instanceof Error ? error.message : error;
    this.sendEvent('error', { message: errorMessage });
  }

  close(): void {
    this.response.end();
  }
}

export function createSSEHandler(handler: (connection: SSEConnection, request: any) => Promise<void>) {
  return async (request: any, response: any) => {
    const connection = new SSEConnection(response);
    
    try {
      await handler(connection, request);
    } catch (error) {
      console.error('Error en handler SSE:', error);
      connection.sendError(error instanceof Error ? error : new Error(String(error)));
    }
  };
}

// Tipos de eventos comunes para nuestra aplicación
export const SSEEvents = {
  ITINERARY_GENERATION_START: 'itinerary-generation-start',
  ITINERARY_GENERATION_PROGRESS: 'itinerary-generation-progress',
  ITINERARY_GENERATION_COMPLETE: 'itinerary-generation-complete',
  ITINERARY_GENERATION_ERROR: 'itinerary-generation-error',
  
  SEARCH_START: 'search-start',
  SEARCH_PROGRESS: 'search-progress',
  SEARCH_COMPLETE: 'search-complete',
  SEARCH_ERROR: 'search-error',
  
  SCRAPE_START: 'scrape-start',
  SCRAPE_PROGRESS: 'scrape-progress',
  SCRAPE_COMPLETE: 'scrape-complete',
  SCRAPE_ERROR: 'scrape-error',
  
  CHAT_RESPONSE: 'chat-response',
  CHAT_ERROR: 'chat-error',
  
  NOTIFICATION: 'notification',
  ERROR: 'error'
} as const;

export type SSEEventType = typeof SSEEvents[keyof typeof SSEEvents];

// Cliente SSE para el frontend
export class SSEClient {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor(private url: string) {}

  connect(): void {
    if (this.eventSource) {
      this.disconnect();
    }

    this.eventSource = new EventSource(this.url);

    this.eventSource.onopen = () => {
      console.log('Conexión SSE establecida');
    };

    this.eventSource.onerror = (error) => {
      console.error('Error en conexión SSE:', error);
      this.emit('error', error);
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('message', data);
      } catch (error) {
        console.error('Error al parsear mensaje SSE:', error);
      }
    };

    // Configurar listeners para eventos específicos
    this.listeners.forEach((callbacks, event) => {
      this.eventSource?.addEventListener(event, (e: any) => {
        try {
          const data = JSON.parse(e.data);
          callbacks.forEach(callback => callback(data));
        } catch (error) {
          console.error(`Error al parsear evento ${event}:`, error);
        }
      });
    });
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    // Si ya hay una conexión activa, agregar el listener
    if (this.eventSource) {
      this.eventSource.addEventListener(event, (e: any) => {
        try {
          const data = JSON.parse(e.data);
          callback(data);
        } catch (error) {
          console.error(`Error al parsear evento ${event}:`, error);
        }
      });
    }
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}