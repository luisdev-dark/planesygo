import { ScrapedContent } from '@/lib/scraper';
import { extractKeywords, summarizeText, cleanHtmlText } from '@/lib/text';

export interface Source {
  title: string;
  url: string;
  index: number;
}

export interface PreparedContext {
  text: string;
  sources: Source[];
  wordCount: number;
}

export interface ContextPreparerOptions {
  maxLength?: number;
  includeCitations?: boolean;
  removeDuplicates?: boolean;
  summarizeLongContent?: boolean;
}

export function prepareContext(
  contents: Array<ScrapedContent & { source?: Source }>, 
  options: ContextPreparerOptions = {}
): PreparedContext {
  const {
    maxLength = 10000,
    includeCitations = true,
    removeDuplicates = true,
    summarizeLongContent = true
  } = options;

  // Extraer fuentes
  const sources: Source[] = contents
    .filter(content => content.source)
    .map(content => content.source!);

  // Preparar contenido de cada fuente
  const processedContents = contents.map((content, index) => {
    let text = content.content;
    
    // Limpiar el texto
    text = cleanHtmlText(text);
    
    // Resumir si es muy largo
    if (summarizeLongContent && text.length > 2000) {
      text = summarizeText(text, 1500);
    }
    
    // Añadir cita si está habilitado
    if (includeCitations && content.source) {
      const citation = `【${content.source.index}】`;
      text = `${text}\n\nFuente: ${citation}`;
    }
    
    return {
      text,
      source: content.source
    };
  });

  // Combinar todos los contenidos
  let combinedText = processedContents
    .map(content => content.text)
    .join('\n\n---\n\n');

  // Eliminar duplicados si está habilitado
  if (removeDuplicates) {
    combinedText = removeDuplicateContent(combinedText);
  }

  // Recortar si excede la longitud máxima
  if (combinedText.length > maxLength) {
    combinedText = combinedText.substring(0, maxLength - 3) + '...';
  }

  // Contar palabras
  const wordCount = countWords(combinedText);

  return {
    text: combinedText,
    sources,
    wordCount
  };
}

function removeDuplicateContent(text: string): string {
  const lines = text.split('\n');
  const seenLines = new Set<string>();
  const uniqueLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !seenLines.has(trimmedLine)) {
      seenLines.add(trimmedLine);
      uniqueLines.push(line);
    } else if (!trimmedLine) {
      // Mantener líneas vacías para preservar estructura
      uniqueLines.push(line);
    }
  }

  return uniqueLines.join('\n');
}

function countWords(text: string): number {
  // Eliminar etiquetas HTML y contar palabras
  const plainText = text.replace(/<[^>]*>/g, '');
  const words = plainText.trim().split(/\s+/);
  return words.filter(word => word.length > 0).length;
}

export function extractKeyInformation(text: string, maxItems: number = 10): Array<{ text: string; source?: number }> {
  // Extraer información clave como precios, fechas, lugares, etc.
  const patterns = [
    // Precios
    /\$?(\d+(?:\.\d{2})?)\s*(USD|EUR|PEN|soles|dólares|euros)/gi,
    // Fechas
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g,
    // Horarios
    /(\d{1,2}:\d{2})\s*(a|al|hasta|-)\s*(\d{1,2}:\d{2})/gi,
    // Lugares
    /(visita|lugar|sitio|dirección):\s*([^.]+)/gi,
    // Distancias
    /(\d+(?:\.\d+)?)\s*(km|kilómetros|m|metros|millas)/gi,
    // Duraciones
    /(\d+)\s*(horas|hora|hr|minutos|min|días|día)/gi
  ];

  const keyInfo: Array<{ text: string; source?: number }> = [];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        if (keyInfo.length >= maxItems) break;
        keyInfo.push({ text: match });
      }
    }
    if (keyInfo.length >= maxItems) break;
  }

  return keyInfo;
}

export function formatContextWithSources(context: PreparedContext): string {
  let formatted = context.text;
  
  // Añadir sección de fuentes al final
  if (context.sources.length > 0) {
    formatted += '\n\n---\n\nFUENTES:\n';
    context.sources.forEach(source => {
      formatted += `【${source.index}】 ${source.title} - ${source.url}\n`;
    });
  }

  return formatted;
}

export function createContextSummary(context: PreparedContext, maxLength: number = 500): string {
  // Extraer palabras clave del contexto
  const keywords = extractKeywords(context.text, 15);
  
  // Crear un resumen basado en las palabras clave
  let summary = `Este contexto incluye información sobre ${keywords.join(', ')}. `;
  summary += `Se han consultado ${context.sources.length} fuentes y se ha extraído un total de ${context.wordCount} palabras de información relevante.`;
  
  return summary.length > maxLength ? summary.substring(0, maxLength - 3) + '...' : summary;
}