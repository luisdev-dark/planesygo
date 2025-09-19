// Utilidades para procesamiento de texto

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength - 3) + '...';
}

export function extractKeywords(text: string, maxKeywords: number = 10): string[] {
  // Palabras comunes en español a ignorar
  const stopWords = [
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'pero', 'si', 'no',
    'de', 'del', 'al', 'en', 'con', 'por', 'para', 'como', 'que', 'es', 'son', 'se',
    'su', 'sus', 'mi', 'tu', 'nuestro', 'vuestro', 'a', 'ante', 'bajo', 'cabe', 'con',
    'contra', 'de', 'desde', 'durante', 'en', 'entre', 'hacia', 'hasta', 'para',
    'por', 'según', 'sin', 'so', 'sobre', 'tras', 'versus', 'vía', 'este', 'esta',
    'esto', 'ese', 'esa', 'eso', 'aquel', 'aquella', 'aquello', 'le', 'les', 'lo', 'la'
  ];
  
  // Limpiar el texto y convertir a minúsculas
  const cleanText = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Dividir en palabras
  const words = cleanText.split(' ');
  
  // Contar frecuencia de palabras (ignorando stop words)
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    if (word.length > 2 && !stopWords.includes(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  // Ordenar por frecuencia y devolver las más comunes
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

export function summarizeText(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  // Dividir en oraciones
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let summary = '';
  let currentLength = 0;
  
  for (const sentence of sentences) {
    const sentenceLength = sentence.length + 1; // +1 por el punto
    
    if (currentLength + sentenceLength > maxLength) {
      break;
    }
    
    summary += sentence.trim() + '. ';
    currentLength += sentenceLength;
  }
  
  return summary.trim() || truncateText(text, maxLength);
}

export function cleanHtmlText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ') // Eliminar etiquetas HTML
    .replace(/&nbsp;/g, ' ') // Reemplazar espacios no rompibles
    .replace(/&/g, '&') // Reemplazar entidades HTML
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/\s+/g, ' ') // Reducir múltiples espacios a uno
    .trim();
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches || [];
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Reducir múltiples guiones a uno
    .trim();
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function unescapeHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}