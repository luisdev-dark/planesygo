import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { extractMainContent } from './readability';
import { securityManager } from './security';

export interface ScrapedContent {
  title: string;
  content: string;
  excerpt: string;
  url: string;
  wordCount: number;
}

export async function scrapeContent(url: string): Promise<ScrapedContent> {
  try {
    // Fetch the HTML content using security manager
    const { content: html, contentType } = await securityManager.safeFetchContent(url, 'Viajesmart-Bot/1.0');

    if (!contentType.includes('html')) {
      throw new Error(`El contenido no es HTML: ${contentType}`);
    }
    
    // Extract main content using readability
    const { title, content, excerpt, wordCount } = extractMainContent(html, url);

    return {
      title,
      content,
      excerpt,
      url,
      wordCount
    };
  } catch (error) {
    console.error(`Error al scrapear ${url}:`, error);
    throw new Error(`Error al extraer contenido de ${url}`);
  }
}

export async function scrapeMultipleContent(urls: string[]): Promise<ScrapedContent[]> {
  const results: ScrapedContent[] = [];
  
  // Limitar el número de URLs para evitar sobrecarga
  const limitedUrls = urls.slice(0, 5);
  
  for (const url of limitedUrls) {
    try {
      const content = await scrapeContent(url);
      results.push(content);
    } catch (error) {
      console.error(`Error al procesar ${url}:`, error);
      // Continuar con las demás URLs aunque falle una
    }
  }
  
  return results;
}

export async function extractTextFromHTML(html: string): Promise<string> {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());
    
    // Get text content
    const text = document.body?.textContent || '';
    
    // Clean up text
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  } catch (error) {
    console.error('Error al extraer texto del HTML:', error);
    throw new Error('Error al procesar el contenido HTML');
  }
}

export async function extractStructuredData(html: string): Promise<any[]> {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Find JSON-LD structured data
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    const structuredData: any[] = [];
    
    jsonLdScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        structuredData.push(data);
      } catch (e) {
        console.warn('Error al parsear JSON-LD:', e);
      }
    });
    
    return structuredData;
  } catch (error) {
    console.error('Error al extraer datos estructurados:', error);
    return [];
  }
}

// Función mejorada para scraping con plan B cuando el scraping falla
export async function scrapeWithFallback(url: string, searchResult?: any): Promise<ScrapedContent> {
  try {
    // Intentar scraping normal primero
    return await scrapeContent(url);
  } catch (primaryError) {
    console.warn(`Error en scraping primario para ${url}:`, primaryError);
    
    // Plan B: Intentar métodos alternativos de extracción
    try {
      // Método 1: Usar JSDOM directo sin Readability
      const { content: html, contentType } = await securityManager.safeFetchContent(url, 'Viajesmart-Bot/1.0');
      
      if (contentType.includes('html')) {
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        // Eliminar elementos no deseados
        const unwantedElements = document.querySelectorAll('script, style, nav, header, footer, aside, .ads, .advertisement, .sidebar, .comments');
        unwantedElements.forEach(el => el.remove());
        
        // Extraer título
        const title = document.querySelector('title')?.textContent ||
                     document.querySelector('h1')?.textContent ||
                     searchResult?.title ||
                     'Sin título';
        
        // Extraer contenido principal
        const mainContent = document.querySelector('main, article, .content, .post, .entry') ||
                           document.querySelector('div[role="main"]') ||
                           document.body;
        
        // Extraer texto
        const text = mainContent?.textContent || '';
        const cleanedText = text
          .replace(/\s+/g, ' ')
          .replace(/\n\s*\n/g, '\n\n')
          .trim();
        
        // Crear extracto
        const excerpt = cleanedText.substring(0, 200) + (cleanedText.length > 200 ? '...' : '');
        
        // Contar palabras
        const wordCount = cleanedText.split(/\s+/).filter(word => word.length > 0).length;
        
        // Si tenemos contenido suficiente, devolverlo
        if (wordCount > 50) {
          return {
            title,
            content: cleanedText,
            excerpt,
            url,
            wordCount
          };
        }
      }
      
      // Método 2: Si no hay suficiente contenido HTML, usar el snippet del resultado de búsqueda
      if (searchResult && searchResult.snippet) {
        const enhancedSnippet = `
          # ${searchResult.title || 'Sin título'}
          
          ${searchResult.snippet}
          
          *Fuente: ${url}*
        `;
        
        return {
          title: searchResult.title || 'Sin título',
          content: enhancedSnippet,
          excerpt: searchResult.snippet,
          url,
          wordCount: searchResult.snippet.split(/\s+/).length
        };
      }
      
      // Método 3: Último recurso - crear contenido mínimo basado en la URL
      const domain = new URL(url).hostname.replace('www.', '');
      const minimalContent = `
        # Información de ${domain}
        
        No se pudo extraer contenido detallado de esta página.
        Para obtener información completa, visita directamente: ${url}
        
        *Nota: Esta página podría contener información valiosa sobre tu destino.*
      `;
      
      return {
        title: `Información de ${domain}`,
        content: minimalContent,
        excerpt: 'No se pudo extraer contenido detallado de esta página.',
        url,
        wordCount: minimalContent.split(/\s+/).length
      };
      
    } catch (fallbackError) {
      console.error(`Error en el plan B para ${url}:`, fallbackError);
      
      // Último recurso: contenido mínimo
      const domain = new URL(url).hostname.replace('www.', '');
      const minimalContent = `
        # Información de ${domain}
        
        No se pudo extraer contenido de esta página debido a restricciones de acceso.
        Para obtener información completa, visita directamente: ${url}
        
        *Nota: Esta página podría contener información valiosa sobre tu destino.*
      `;
      
      return {
        title: `Información de ${domain}`,
        content: minimalContent,
        excerpt: 'No se pudo acceder al contenido de esta página.',
        url,
        wordCount: minimalContent.split(/\s+/).length
      };
    }
  }
}