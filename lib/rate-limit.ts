// Rate limiting simple para APIs externas
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  public limits: Map<string, { maxRequests: number; windowMs: number }> = new Map();

  constructor() {
    // Configurar límites por defecto para diferentes APIs
    this.setLimit('openrouter', { maxRequests: 60, windowMs: 60 * 1000 }); // 60 peticiones por minuto
    this.setLimit('serpapi', { maxRequests: 100, windowMs: 60 * 1000 }); // 100 peticiones por minuto
    this.setLimit('scraping', { maxRequests: 20, windowMs: 60 * 1000 }); // 20 peticiones por minuto
  }

  setLimit(key: string, limit: { maxRequests: number; windowMs: number }): void {
    this.limits.set(key, limit);
  }

  async checkRateLimit(key: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const limit = this.limits.get(key);
    if (!limit) {
      return { allowed: true, remaining: Infinity, resetTime: 0 };
    }

    const now = Date.now();
    const windowStart = now - limit.windowMs;
    
    // Obtener las solicitudes recientes para esta clave
    let requests = this.requests.get(key) || [];
    
    // Filtrar las solicitudes que están fuera de la ventana de tiempo
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Actualizar el mapa con las solicitudes filtradas
    this.requests.set(key, requests);
    
    // Verificar si se excede el límite
    const allowed = requests.length < limit.maxRequests;
    const remaining = Math.max(0, limit.maxRequests - requests.length);
    const resetTime = requests.length > 0 ? requests[0] + limit.windowMs : now;
    
    if (allowed) {
      // Si está permitido, agregar la solicitud actual
      requests.push(now);
      this.requests.set(key, requests);
    }
    
    return { allowed, remaining, resetTime };
  }

  async waitForAvailability(key: string): Promise<void> {
    const check = async (): Promise<void> => {
      const { allowed, resetTime } = await this.checkRateLimit(key);
      
      if (allowed) {
        return;
      }
      
      const waitTime = resetTime - Date.now();
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime + 100)); // +100ms de margen
        return check(); // Reintentar
      }
    };
    
    await check();
  }
}

// Instancia global del rate limiter
export const rateLimiter = new RateLimiter();

// Decorador para funciones con rate limiting
export function withRateLimit(key: string) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!;
    
    descriptor.value = (async function(this: any, ...args: any[]) {
      await rateLimiter.waitForAvailability(key);
      return method.apply(this, args);
    }) as any;
    
    return descriptor;
  };
}

// Middleware para Express (si se necesita en el futuro)
export function createRateLimitMiddleware(key: string) {
  return async (req: any, res: any, next: any) => {
    try {
      const { allowed, remaining, resetTime } = await rateLimiter.checkRateLimit(key);
      
      res.set('X-RateLimit-Limit', rateLimiter.limits.get(key)?.maxRequests.toString() || '0');
      res.set('X-RateLimit-Remaining', remaining.toString());
      res.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
      
      if (!allowed) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Has excedido el límite de solicitudes. Por favor, intenta de nuevo más tarde.',
          resetTime
        });
      }
      
      next();
    } catch (error) {
      console.error('Error en el rate limiting:', error);
      next();
    }
  };
}