import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export interface ReadabilityResult {
  title: string;
  content: string;
  excerpt: string;
  wordCount: number;
}

export function extractMainContent(html: string, url: string): ReadabilityResult {
  try {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error('No se pudo extraer el contenido principal');
    }

    // Calcular el número de palabras
    const wordCount = countWords(article.content);

    return {
      title: article.title || 'Sin título',
      content: article.content,
      excerpt: article.excerpt || '',
      wordCount
    };
  } catch (error) {
    console.error('Error al extraer contenido con Readability:', error);
    throw new Error('Error al procesar el contenido de la página');
  }
}

function countWords(text: string): number {
  // Eliminar etiquetas HTML y contar palabras
  const plainText = text.replace(/<[^>]*>/g, '');
  const words = plainText.trim().split(/\s+/);
  return words.filter(word => word.length > 0).length;
}

export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Reemplazar múltiples espacios con uno solo
    .replace(/\n\s*\n/g, '\n\n') // Limpiar saltos de línea múltiples
    .trim(); // Eliminar espacios al inicio y final
}

export function extractMetadata(html: string): Record<string, string> {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const metadata: Record<string, string> = {};

    // Extraer meta tags
    const metaTags = document.querySelectorAll('meta');
    metaTags.forEach(tag => {
      const name = tag.getAttribute('name') || tag.getAttribute('property');
      const content = tag.getAttribute('content');
      
      if (name && content) {
        metadata[name] = content;
      }
    });

    // Extraer título
    const titleTag = document.querySelector('title');
    if (titleTag) {
      metadata.title = titleTag.textContent || '';
    }

    // Extraer descripción
    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
      metadata.description = descriptionTag.getAttribute('content') || '';
    }

    return metadata;
  } catch (error) {
    console.error('Error al extraer metadatos:', error);
    return {};
  }
}

export function sanitizeContent(content: string): string {
  // Eliminar scripts y estilos
  let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Eliminar comentarios HTML
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');
  
  // Eliminar atributos potencialmente peligrosos
  sanitized = sanitized.replace(/on\w+="[^"]*"/g, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/g, '');
  
  return sanitized;
}