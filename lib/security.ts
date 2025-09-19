import { JSDOM } from 'jsdom';

export interface SecurityOptions {
  timeout?: number;
  maxContentSize?: number;
  allowedContentTypes?: string[];
  respectRobotsTxt?: boolean;
  sanitizeHtml?: boolean;
}

export class SecurityManager {
  private options: SecurityOptions;

  constructor(options: SecurityOptions = {}) {
    this.options = {
      timeout: 10000, // 10 segundos por defecto
      maxContentSize: 5 * 1024 * 1024, // 5MB por defecto
      allowedContentTypes: ['text/html', 'text/plain', 'application/json'],
      respectRobotsTxt: true,
      sanitizeHtml: true,
      ...options
    };
  }

  // Verificar si una URL puede ser scrapeda según robots.txt
  async canScrapeUrl(url: string, userAgent: string = 'Viajesmart-Bot/1.0'): Promise<boolean> {
    if (!this.options.respectRobotsTxt) {
      return true;
    }

    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.origin}/robots.txt`;
      
      const response = await this.fetchWithTimeout(robotsUrl, {
        headers: { 'User-Agent': userAgent }
      });
      
      if (!response.ok) {
        // Si no hay robots.txt, asumimos que está permitido
        return true;
      }
      
      const robotsTxt = await response.text();
      return this.parseRobotsTxt(robotsTxt, urlObj.pathname, userAgent);
    } catch (error) {
      // Si hay error al obtener robots.txt, asumimos que está permitido
      console.warn(`Error al verificar robots.txt para ${url}:`, error);
      return true;
    }
  }

  // Fetch con timeout
  async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Timeout al fetchear ${url}`);
      }
      throw error;
    }
  }

  // Parsear robots.txt
  private parseRobotsTxt(robotsTxt: string, path: string, userAgent: string): boolean {
    const lines = robotsTxt.split('\n');
    let currentUserAgent = '*';
    const disallowedPaths: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('User-agent:')) {
        currentUserAgent = trimmedLine.substring('User-agent:'.length).trim();
      } else if (trimmedLine.startsWith('Disallow:') && 
                (currentUserAgent === '*' || userAgent.includes(currentUserAgent))) {
        const disallowedPath = trimmedLine.substring('Disallow:'.length).trim();
        if (disallowedPath) {
          disallowedPaths.push(disallowedPath);
        }
      }
    }
    
    // Verificar si el path está deshabilitado
    for (const disallowedPath of disallowedPaths) {
      if (disallowedPath === '/' || path.startsWith(disallowedPath)) {
        return false;
      }
    }
    
    return true;
  }

  // Sanitizar HTML para eliminar contenido malicioso
  sanitizeHtml(html: string): string {
    if (!this.options.sanitizeHtml) {
      return html;
    }

    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Eliminar scripts y estilos
      const scripts = document.querySelectorAll('script, style');
      scripts.forEach(element => element.remove());
      
      // Eliminar iframes
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(element => element.remove());
      
      // Eliminar atributos potencialmente peligrosos
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        const attrs = element.getAttributeNames();
        for (const attr of attrs) {
          if (attr.toLowerCase().startsWith('on') || 
              attr.toLowerCase().includes('javascript:') ||
              attr.toLowerCase().includes('data:')) {
            element.removeAttribute(attr);
          }
        }
      });
      
      return document.documentElement.outerHTML;
    } catch (error) {
      console.error('Error al sanitizar HTML:', error);
      return html;
    }
  }

  // Validar tipo de contenido
  isValidContentType(contentType: string): boolean {
    return this.options.allowedContentTypes!.some(allowed => 
      contentType.toLowerCase().includes(allowed.toLowerCase())
    );
  }

  // Verificar tamaño del contenido
  isValidContentSize(contentSize: number): boolean {
    return contentSize <= this.options.maxContentSize!;
  }

  // Extraer contenido de forma segura
  async safeFetchContent(url: string, userAgent: string = 'Viajesmart-Bot/1.0'): Promise<{
    content: string;
    contentType: string;
    contentLength: number;
  }> {
    // Verificar robots.txt
    const canScrape = await this.canScrapeUrl(url, userAgent);
    if (!canScrape) {
      throw new Error(`Scraping no permitido para ${url} según robots.txt`);
    }

    // Fetch con timeout
    const response = await this.fetchWithTimeout(url, {
      headers: { 
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    // Verificar tipo de contenido
    const contentType = response.headers.get('content-type') || '';
    if (!this.isValidContentType(contentType)) {
      throw new Error(`Tipo de contenido no permitido: ${contentType}`);
    }

    // Verificar tamaño del contenido
    const contentLength = parseInt(response.headers.get('content-length') || '0');
    if (contentLength > 0 && !this.isValidContentSize(contentLength)) {
      throw new Error(`Contenido demasiado grande: ${contentLength} bytes`);
    }

    // Obtener contenido
    let content = await response.text();
    
    // Verificar tamaño real del contenido
    if (!this.isValidContentSize(content.length)) {
      throw new Error(`Contenido demasiado grande: ${content.length} bytes`);
    }

    // Sanitizar HTML
    if (contentType.includes('html')) {
      content = this.sanitizeHtml(content);
    }

    return {
      content,
      contentType,
      contentLength: content.length
    };
  }
}

// Instancia global del gestor de seguridad
export const securityManager = new SecurityManager();

// Funciones de utilidad para seguridad
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

export function sanitizeText(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

export function isSafeRedirect(url: string, allowedDomains: string[] = []): boolean {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Permitir redirecciones al mismo dominio
    if (allowedDomains.length === 0) {
      return true;
    }
    
    // Verificar si el dominio está en la lista de permitidos
    return allowedDomains.some(allowedDomain => 
      domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
    );
  } catch {
    return false;
  }
}