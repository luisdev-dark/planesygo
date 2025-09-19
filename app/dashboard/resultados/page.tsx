"use client"

import React, { useState, useEffect, useRef } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { marked } from "marked"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { copy } from "@/lib/copy"
import { icons } from "@/lib/icons"
import { useRouter } from "next/navigation"

interface Activity {
  id: string
  time: string
  title: string
  description: string
  duration: string
  cost: number
  currency: string
  distance?: string
  type: "transport" | "food" | "activity" | "accommodation"
  alternatives?: string[]
}

interface DayItinerary {
  day: number
  date: string
  activities: Activity[]
  totalCost: number
  weather: {
    condition: string
    temperature: number
    icon: string
  }
}

interface PlanningData {
  originCountry: string
  destination: string
  startDate: string
  endDate: string
  duration: number
  budget: number[]
  currency: string
  styles: string[]
  transport: string
  preferences: string[]
}

interface ResultData {
  itinerary: string
  metadata: {
    originCountry: string
    destination: string
    days: number
    budget: number
    travelStyle: string
    sources: any[]
    wordCount: number
    processingTime: number
  }
  planningData: PlanningData
}

export default function ResultadosPage() {
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState("1")
  const [isRefining, setIsRefining] = useState(false)
  const [refinementPrompt, setRefinementPrompt] = useState("")
  const [resultData, setResultData] = useState<ResultData | null>(null)
  const [itinerary, setItinerary] = useState<DayItinerary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [renderedItinerary, setRenderedItinerary] = useState<string>("")

  useEffect(() => {
    // Cargar los datos desde localStorage
    const savedResults = localStorage.getItem('itineraryResults')
    if (savedResults) {
      try {
        const parsedData = JSON.parse(savedResults)
        setResultData(parsedData)
        
        // Procesar el itinerario generado por la IA solo si no se ha procesado antes
        if (itinerary.length === 0) {
          processItinerary(parsedData)
        }
        
        // Renderizar el itinerario como HTML
        const renderMarkdown = async () => {
          if (parsedData.itinerary) {
            // Extraer fuentes del itinerario si existen
            const sources: { [key: string]: string } = {};
            const sourceRegex = /【(\d+)】\s*(https?:\/\/[^\s]+)/g;
            let match;
            
            while ((match = sourceRegex.exec(parsedData.itinerary)) !== null) {
              sources[match[1]] = match[2];
            }
            
            // Procesar el itinerario para reemplazar las citas con enlaces
            let processedText = parsedData.itinerary;
            
            // Reemplazar las citas 【X】 con enlaces
            processedText = processedText.replace(/【(\d+)】/g, (match: string, num: string) => {
              if (sources[num]) {
                return `<a href="${sources[num]}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">【${num}】</a>`;
              }
              return match;
            });
            
            // Generar HTML con marked
            const html = await marked(processedText, {
              breaks: true,
              gfm: true
            });
            
            // Extraer todas las fuentes únicas para la sección de referencias
            const uniqueSources = Object.entries(sources).map(([num, url]) => ({
              num,
              url
            }));
            
            // Si hay fuentes, agregar sección de referencias al final
            if (uniqueSources.length > 0) {
              const referencesSection = `
                <div class="mt-8 pt-4 border-t border-gray-200">
                  <h2 class="text-xl font-bold mb-3">Referencias y Enlaces Útiles</h2>
                  <ul class="space-y-2">
                    ${uniqueSources.map(({num, url}) =>
                      `<li class="flex items-start">
                        <span class="text-blue-600 font-medium mr-2">【${num}】</span>
                        <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline break-all">${url}</a>
                      </li>`
                    ).join('')}
                  </ul>
                </div>
              `;
              
              setRenderedItinerary(html + referencesSection);
            } else {
              setRenderedItinerary(html);
            }
          }
        }
        renderMarkdown()
      } catch (error) {
        console.error('Error al procesar los resultados:', error)
      }
    } else {
      // Si no hay datos, redirigir a la página de planificación
      router.push('/dashboard/plan')
    }
    setIsLoading(false)
  }, [router, itinerary.length])

  // Función para procesar el itinerario generado por la IA
  const processItinerary = (data: ResultData) => {
    // En lugar de usar datos simulados, ahora procesamos el itinerario real
    // generado por la IA a partir de la búsqueda en tiempo real
    
    try {
      // Intentar parsear el itinerario si viene en formato JSON
      const parsedItinerary = JSON.parse(data.itinerary);
      setItinerary(parsedItinerary);
    } catch (error) {
      // Si no es JSON, intentamos extraer la información del texto
      console.log("El itinerario no está en formato JSON, procesando como texto");
      
      try {
        // Extraer días del itinerario usando expresiones regulares
        const dayRegex = /Día\s+(\d+):\s*([\s\S]*?)(?=Día\s+\d+:|$)/g;
        const dayMatches = [...data.itinerary.matchAll(dayRegex)];
        
        if (dayMatches.length > 0) {
          const processedItinerary: DayItinerary[] = dayMatches.map((match, index) => {
            const dayNumber = parseInt(match[1]);
            const dayContent = match[2];
            
            // Extraer actividades del día
            const activityRegex = /(\d{1,2}:\d{2})\s*-\s*(.*?)(?=\n\d{1,2}:\d{2}|$)/g;
            const activityMatches = [...dayContent.matchAll(activityRegex)];
            
            const activities: Activity[] = activityMatches.map((actMatch, actIndex) => {
              const time = actMatch[1];
              const activityContent = actMatch[2];
              
              // Extraer título y descripción
              const titleMatch = activityContent.match(/^(.*?)(?=\n|$)/);
              const title = titleMatch ? titleMatch[1].trim() : "Actividad";
              
              // Extraer descripción (todo después del título)
              const description = activityContent.replace(titleMatch?.[0] || "", "").trim();
              
              // Extraer costo si existe
              const costMatch = description.match(/(\d+(?:\.\d+)?)\s*(€|\$|USD|EUR)/);
              const cost = costMatch ? parseFloat(costMatch[1]) : 0;
              const currency = costMatch ? costMatch[2] : data.planningData.currency.toUpperCase();
              
              // Extraer duración si existe
              const durationMatch = description.match(/(\d+)\s*(min|h|hora|horas)/);
              const duration = durationMatch ? `${durationMatch[1]}${durationMatch[2] === "min" ? "min" : durationMatch[2] === "h" ? "h" : durationMatch[2]}` : "1h";
              
              // Determinar tipo de actividad
              let type: Activity["type"] = "activity";
              if (title.toLowerCase().includes("comida") || title.toLowerCase().includes("almuerzo") || title.toLowerCase().includes("cena") || title.toLowerCase().includes("restaurante")) {
                type = "food";
              } else if (title.toLowerCase().includes("hotel") || title.toLowerCase().includes("alojamiento") || title.toLowerCase().includes("check-in")) {
                type = "accommodation";
              } else if (title.toLowerCase().includes("vuelo") || title.toLowerCase().includes("traslado") || title.toLowerCase().includes("transporte") || title.toLowerCase().includes("metro") || title.toLowerCase().includes("bus")) {
                type = "transport";
              }
              
              return {
                id: `${dayNumber}-${actIndex + 1}`,
                time,
                title,
                description,
                duration,
                cost,
                currency,
                type,
              };
            });
            
            // Calcular costo total del día
            const totalCost = activities.reduce((sum, activity) => sum + activity.cost, 0);
            
            // Generar información del clima (simulada)
            const weatherConditions = ["Soleado", "Parcialmente nublado", "Nublado", "Lluvia ligera"];
            const weatherIcons = ["sun", "cloud", "cloud", "cloudRain"];
            const weatherIndex = Math.floor(Math.random() * weatherConditions.length);
            
            return {
              day: dayNumber,
              date: data.planningData.startDate || `2024-03-${15 + index}`,
              activities,
              totalCost,
              weather: {
                condition: weatherConditions[weatherIndex],
                temperature: 16 + Math.floor(Math.random() * 10),
                icon: weatherIcons[weatherIndex],
              },
            };
          });
          
          setItinerary(processedItinerary);
        } else {
          // Si no podemos procesar el texto, mostramos el itinerario como texto sin formato
          console.error("No se pudo procesar el itinerario");
          
          // Creamos un día con el itinerario en texto plano
          const plainTextDay: DayItinerary = {
            day: 1,
            date: data.planningData.startDate || "2024-03-15",
            activities: [{
              id: "1",
              time: "00:00",
              title: "Itinerario completo",
              description: data.itinerary,
              duration: "N/A",
              cost: 0,
              currency: data.planningData.currency.toUpperCase(),
              type: "activity",
            }],
            totalCost: 0,
            weather: {
              condition: "Soleado",
              temperature: 22,
              icon: "sun",
            },
          };
          
          setItinerary([plainTextDay]);
        }
      } catch (error) {
        console.error('Error al procesar el texto del itinerario:', error);
        
        // En caso de error, mostramos el itinerario como texto sin formato
        const plainTextDay: DayItinerary = {
          day: 1,
          date: data.planningData.startDate || "2024-03-15",
          activities: [{
            id: "1",
            time: "00:00",
            title: "Itinerario completo",
            description: data.itinerary,
            duration: "N/A",
            cost: 0,
            currency: data.planningData.currency.toUpperCase(),
            type: "activity",
          }],
          totalCost: 0,
          weather: {
            condition: "Soleado",
            temperature: 22,
            icon: "sun",
          },
        };
        
        setItinerary([plainTextDay]);
      }
    }
  }

  const totalBudget = itinerary.reduce((sum, day) => sum + day.totalCost, 0)

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "transport":
        return icons.bus
      case "food":
        return icons.utensils
      case "activity":
        return icons.camera
      case "accommodation":
        return icons.building
      default:
        return icons.mapPin
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sun":
        return icons.sun
      case "cloud":
        return icons.cloud
      case "cloudRain":
        return icons.cloudRain
      default:
        return icons.sun
    }
  }

  // Función para obtener la distancia entre dos países
  const getDistance = (origin: string, destination: string): string => {
    // En una implementación real, esto podría usar una API de geolocalización
    // Por ahora, devolveremos una distancia aproximada basada en algunos casos comunes
    const distances: Record<string, Record<string, string>> = {
      "España": {
        "Francia": "1,054 km",
        "Italia": "1,367 km",
        "Portugal": "400 km",
        "Alemania": "1,616 km",
        "Reino Unido": "1,243 km",
        "Estados Unidos": "7,533 km",
        "México": "9,095 km",
        "Argentina": "10,647 km",
        "Colombia": "8,025 km",
        "Perú": "9,935 km",
        "Chile": "11,070 km",
        "Japón": "11,770 km",
        "China": "9,226 km",
        "Australia": "17,016 km",
      },
      "México": {
        "Estados Unidos": "3,112 km",
        "Canadá": "4,768 km",
        "España": "9,095 km",
        "Francia": "9,177 km",
        "Italia": "10,273 km",
        "Alemania": "9,631 km",
        "Reino Unido": "8,921 km",
        "Argentina": "7,385 km",
        "Colombia": "3,928 km",
        "Perú": "4,223 km",
        "Chile": "6,629 km",
        "Brasil": "7,405 km",
        "Japón": "12,879 km",
        "China": "12,429 km",
        "Australia": "13,470 km",
      },
      "Estados Unidos": {
        "Canadá": "2,260 km",
        "México": "3,112 km",
        "España": "7,533 km",
        "Francia": "7,685 km",
        "Italia": "8,222 km",
        "Alemania": "7,799 km",
        "Reino Unido": "6,659 km",
        "Argentina": "8,890 km",
        "Colombia": "4,623 km",
        "Perú": "6,589 km",
        "Chile": "8,427 km",
        "Brasil": "7,685 km",
        "Japón": "10,851 km",
        "China": "11,141 km",
        "Australia": "15,513 km",
      }
    };

    // Verificar si tenemos la distancia en nuestra base de datos
    if (distances[origin] && distances[origin][destination]) {
      return distances[origin][destination];
    }

    // Si no encontramos la distancia, devolvemos un valor predeterminado
    return "Distancia no disponible";
  }

  const handleRefine = async () => {
    setIsRefining(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsRefining(false)
    setRefinementPrompt("")
  }

  const handleNewPlan = () => {
    router.push('/dashboard/plan')
  }

  const handleDownloadPDF = async () => {
    if (!resultData) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Buscar la tarjeta que contiene el itinerario detallado
      const itineraryCard = document.querySelector('.lg\\:col-span-3 .card');
      
      if (!itineraryCard) {
        throw new Error('No se pudo encontrar el elemento del itinerario');
      }
      
      // Crear un elemento temporal que contendrá el contenido del itinerario
      const tempElement = document.createElement('div');
      
      // Clonar el contenido de la tarjeta del itinerario
      const clonedContent = itineraryCard.cloneNode(true) as HTMLElement;
      
      // Eliminar los botones y elementos interactivos que no son necesarios en el PDF
      const interactiveElements = clonedContent.querySelectorAll('button, .sheet, input, textarea');
      interactiveElements.forEach(el => el.remove());
      
      // Reemplazar todos los SVG con un placeholder para evitar el error con oklch/oklab
      const svgElements = clonedContent.querySelectorAll('svg');
      svgElements.forEach(svg => {
        const placeholder = document.createElement('div');
        placeholder.className = svg.className || '';
        placeholder.style.width = svg.getAttribute('width') || '24px';
        placeholder.style.height = svg.getAttribute('height') || '24px';
        placeholder.style.display = 'inline-flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.innerHTML = '[Icono]';
        
        // Reemplazar el SVG con el placeholder
        if (svg.parentNode) {
          svg.parentNode.replaceChild(placeholder, svg);
        }
      });
      
      // Aplicar estilos específicos para el PDF
      tempElement.innerHTML = `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #ffffff; color: #1f2937; line-height: 1.6; padding: 1.5rem;">
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              background-color: #ffffff;
              color: #1f2937;
              line-height: 1.6;
            }
            
            .card {
              background-color: #ffffff;
              border-radius: 1rem;
              box-shadow: none;
              overflow: hidden;
              border: 1px solid #e5e7eb;
            }
            
            .card-header {
              padding: 1.5rem;
              border-bottom: 1px solid #f3f4f6;
            }
            
            .card-content {
              padding: 1.5rem;
            }
            
            .card-title {
              font-size: 1.5rem;
              font-weight: 600;
              line-height: 2rem;
              color: #1f2937;
            }
            
            .card-description {
              font-size: 0.875rem;
              color: #6b7280;
              margin-top: 0.25rem;
            }
            
            .bg-muted\\/50 {
              background-color: rgba(249, 250, 251, 0.5);
              border-radius: 0.5rem;
              padding: 1.5rem;
            }
            
            .max-h-\\[600px\\] {
              max-height: none;
              overflow: visible;
            }
            
            .overflow-y-auto {
              overflow: visible;
            }
            
            .prose {
              max-width: none;
              color: #374151;
            }
            
            .prose h1 {
              color: #2563eb;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 10px;
              margin-top: 0;
              font-size: 1.875rem;
              font-weight: 700;
            }
            
            .prose h2 {
              color: #1d4ed8;
              margin-top: 2rem;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 0.5rem;
              font-size: 1.5rem;
              font-weight: 600;
              padding-left: 0.5rem;
              border-left: 4px solid #1d4ed8;
            }
            
            .prose h3 {
              color: #1e40af;
              margin-top: 1.5rem;
              font-size: 1.25rem;
              font-weight: 600;
              padding-left: 0.5rem;
              border-left: 3px solid #1e40af;
            }
            
            .prose h4 {
              color: #1e3a8a;
              margin-top: 1.25rem;
              font-size: 1.125rem;
              font-weight: 600;
              padding-left: 0.5rem;
              border-left: 2px solid #1e3a8a;
            }
            
            .prose h5, .prose h6 {
              color: #1e3a8a;
              margin-top: 1rem;
              font-size: 1rem;
              font-weight: 600;
            }
            
            .prose p { margin-bottom: 1rem; line-height: 1.6; }
            
            .prose ul, .prose ol {
              padding-left: 1.5rem;
              margin-bottom: 1rem;
            }
            
            .prose li {
              margin-bottom: 0.5rem;
              line-height: 1.6;
            }
            
            .prose table {
              border-collapse: collapse;
              width: 100%;
              margin: 1.5rem 0;
              border-radius: 0.375rem;
              overflow: hidden;
            }
            
            .prose th, .prose td {
              border: 1px solid #e5e7eb;
              padding: 0.75rem 1rem;
              text-align: left;
            }
            
            .prose th {
              background-color: #f3f4f6;
              font-weight: 600;
            }
            
            .prose tr:nth-child(even) { background-color: #f9fafb; }
            
            .prose blockquote {
              border-left: 4px solid #d1d5db;
              padding-left: 1rem;
              margin: 1.5rem 0;
              color: #6b7280;
              font-style: italic;
              background-color: #f9fafb;
              padding: 1rem;
              border-radius: 0.375rem;
            }
            
            .prose code {
              background-color: #f3f4f6;
              padding: 0.125rem 0.25rem;
              border-radius: 0.25rem;
              font-size: 0.875rem;
            }
            
            .prose pre {
              background-color: #f3f4f6;
              padding: 1rem;
              border-radius: 0.375rem;
              overflow-x: auto;
              margin: 1.5rem 0;
            }
            
            .prose hr {
              border: none;
              border-top: 1px solid #e5e7eb;
              margin: 2rem 0;
            }
            
            .prose .task-list-item {
              list-style: none;
              margin-left: -1.25rem;
            }
            
            .prose .task-list-item input {
              margin-right: 0.5rem;
            }
            
            .prose a {
              color: #2563eb;
              text-decoration: none;
              transition: color 0.2s;
            }
            
            .prose a:hover {
              color: #1d4ed8;
              text-decoration: underline;
            }
            
            .prose strong {
              font-weight: 600;
              color: #1f2937;
            }
            
            .prose em {
              font-style: italic;
              color: #4b5563;
            }
            
            .text-blue-600 {
              color: #2563eb;
            }
            
            .hover\\:text-blue-800:hover {
              color: #1e40af;
            }
            
            .underline {
              text-decoration: underline;
            }
            
            .border-t {
              border-top-width: 1px;
            }
            
            .border-gray-200 {
              border-color: #e5e7eb;
            }
            
            .mt-8 {
              margin-top: 2rem;
            }
            
            .pt-4 {
              padding-top: 1rem;
            }
            
            .mb-3 {
              margin-bottom: 0.75rem;
            }
            
            .space-y-2 > * + * {
              margin-top: 0.5rem;
            }
            
            .flex-items-start {
              align-items: flex-start;
            }
            
            .font-medium {
              font-weight: 500;
            }
            
            .mr-2 {
              margin-right: 0.5rem;
            }
            
            .break-all {
              word-break: break-all;
            }
            
            /* Pie de página */
            .footer {
              margin-top: 3rem;
              padding-top: 1.5rem;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 0.875rem;
              color: #6b7280;
            }
          </style>
          ${clonedContent.innerHTML}
          <div class="footer">
            <p>Generado por PlanesyGo con inteligencia artificial</p>
            <p>Fecha de generación: ${new Date().toLocaleDateString("es-ES")}</p>
          </div>
        </div>
      `;
      
      // Añadir el elemento temporal al DOM (oculto)
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px';
      tempElement.style.width = '210mm'; // Ancho de A4
      document.body.appendChild(tempElement);
      
      // Configurar opciones para html2canvas
      const options = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: tempElement.scrollWidth,
        height: tempElement.scrollHeight,
        logging: false, // Desactivar logs para reducir errores en consola
        ignoreElements: (element: Element) => {
          // Ignorar elementos que puedan contener estilos problemáticos
          return element.tagName === 'STYLE' ||
                 element.tagName === 'SCRIPT' ||
                 element.tagName === 'NOSCRIPT' ||
                 (element as HTMLElement).style?.backgroundImage?.includes('gradient') ||
                 (element as HTMLElement).style?.background?.includes('oklch') ||
                 (element as HTMLElement).style?.background?.includes('oklab');
        },
        onclone: (clonedDoc: Document) => {
          // Eliminar estilos en línea que puedan contener oklch/oklab
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
              // Eliminar estilos de fondo que puedan contener oklch/oklab
              if (htmlEl.style.background && (
                  htmlEl.style.background.includes('oklch') ||
                  htmlEl.style.background.includes('oklab'))) {
                htmlEl.style.background = '#ffffff';
              }
              
              // Eliminar estilos de color que puedan contener oklch/oklab
              if (htmlEl.style.color && (
                  htmlEl.style.color.includes('oklch') ||
                  htmlEl.style.color.includes('oklab'))) {
                htmlEl.style.color = '#1f2937';
              }
            }
          });
          
          // Asegurarse de que todas las imágenes se carguen antes de capturar
          const images = clonedDoc.querySelectorAll('img');
          const promises = Array.from(images).map(img => {
            return new Promise((resolve) => {
              if (img.complete) {
                resolve(null);
              } else {
                img.onload = () => resolve(null);
                img.onerror = () => resolve(null);
              }
            });
          });
          return Promise.all(promises);
        }
      };
      
      // Capturar el contenido como imagen
      const canvas = await html2canvas(tempElement.firstElementChild as HTMLElement, options);
      
      // Eliminar el elemento temporal
      document.body.removeChild(tempElement);
      
      // Crear el PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Calcular dimensiones para ajustar al PDF
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Si el contenido es más alto que una página, añadir páginas adicionales
      let heightLeft = pdfHeight;
      let position = 0;
      
      // Añadir la primera página
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      // Añadir páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      // Guardar el PDF
      pdf.save(`itinerario-${resultData.metadata.destination.replace(/\s+/g, '-')}.pdf`);
      
      // Mostrar mensaje de éxito
      alert('Itinerario descargado con éxito en formato PDF');
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Error al generar el itinerario. Por favor, inténtalo de nuevo.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <icons.loading className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando tu itinerario...</p>
        </div>
      </div>
    )
  }

  if (!resultData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No se encontraron resultados</h1>
          <Button onClick={handleNewPlan} className="bg-cta hover:bg-cta-hover text-cta-foreground rounded-xl">
            Crear nuevo plan
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header with summary */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tu itinerario para {resultData.metadata.destination}</h1>
            <p className="text-muted-foreground">
              {resultData.planningData.startDate} - {resultData.planningData.endDate} • {resultData.metadata.days} días
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {resultData.planningData.styles.map((style, index) => (
              <Badge key={index} variant="secondary" className="rounded-full">
                {style}
              </Badge>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <icons.wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {totalBudget.toFixed(2)}{resultData.planningData.currency.toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">Presupuesto total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <icons.mapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {itinerary.reduce((sum, day) => sum + day.activities.length, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Actividades</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <icons.route className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {getDistance(resultData.planningData.originCountry, resultData.metadata.destination)}
                  </p>
                  <p className="text-sm text-muted-foreground">Distancia desde {resultData.planningData.originCountry}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main itinerary */}
        <div className="lg:col-span-3">
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle>Itinerario detallado</CardTitle>
              <CardDescription>Actividades organizadas por día con horarios y costos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-6 rounded-xl max-h-[600px] overflow-y-auto prose prose-sm max-w-none">
                <style jsx>{`
                  .prose { max-width: none; }
                  .prose h1 {
                    color: #2563eb;
                    border-bottom: 2px solid #2563eb;
                    padding-bottom: 10px;
                    margin-top: 0;
                    font-size: 1.875rem;
                    font-weight: 700;
                  }
                  .prose h2 {
                    color: #1d4ed8;
                    margin-top: 2rem;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 0.5rem;
                    font-size: 1.5rem;
                    font-weight: 600;
                    padding-left: 0.5rem;
                    border-left: 4px solid #1d4ed8;
                  }
                  .prose h3 {
                    color: #1e40af;
                    margin-top: 1.5rem;
                    font-size: 1.25rem;
                    font-weight: 600;
                    padding-left: 0.5rem;
                    border-left: 3px solid #1e40af;
                  }
                  .prose h4 {
                    color: #1e3a8a;
                    margin-top: 1.25rem;
                    font-size: 1.125rem;
                    font-weight: 600;
                    padding-left: 0.5rem;
                    border-left: 2px solid #1e3a8a;
                  }
                  .prose h5, .prose h6 {
                    color: #1e3a8a;
                    margin-top: 1rem;
                    font-size: 1rem;
                    font-weight: 600;
                  }
                  .prose p { margin-bottom: 1rem; line-height: 1.6; }
                  .prose ul, .prose ol {
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                  }
                  .prose li {
                    margin-bottom: 0.5rem;
                    line-height: 1.6;
                  }
                  .prose table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1.5rem 0;
                    border-radius: 0.375rem;
                    overflow: hidden;
                  }
                  .prose th, .prose td {
                    border: 1px solid #e5e7eb;
                    padding: 0.75rem 1rem;
                    text-align: left;
                  }
                  .prose th {
                    background-color: #f3f4f6;
                    font-weight: 600;
                  }
                  .prose tr:nth-child(even) { background-color: #f9fafb; }
                  .prose blockquote {
                    border-left: 4px solid #d1d5db;
                    padding-left: 1rem;
                    margin: 1.5rem 0;
                    color: #6b7280;
                    font-style: italic;
                    background-color: #f9fafb;
                    padding: 1rem;
                    border-radius: 0.375rem;
                  }
                  .prose code {
                    background-color: #f3f4f6;
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.25rem;
                    font-size: 0.875rem;
                  }
                  .prose pre {
                    background-color: #f3f4f6;
                    padding: 1rem;
                    border-radius: 0.375rem;
                    overflow-x: auto;
                    margin: 1.5rem 0;
                  }
                  .prose hr {
                    border: none;
                    border-top: 1px solid #e5e7eb;
                    margin: 2rem 0;
                  }
                  .prose .task-list-item {
                    list-style: none;
                    margin-left: -1.25rem;
                  }
                  .prose .task-list-item input {
                    margin-right: 0.5rem;
                  }
                  .prose a {
                    color: #2563eb;
                    text-decoration: none;
                    transition: color 0.2s;
                  }
                  .prose a:hover {
                    color: #1d4ed8;
                    text-decoration: underline;
                  }
                  .prose strong {
                    font-weight: 600;
                    color: #1f2937;
                  }
                  .prose em {
                    font-style: italic;
                    color: #4b5563;
                  }
                  /* Estilos para secciones del itinerario */
                  .itinerary-section {
                    background-color: #f9fafb;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                    border-left: 4px solid #3b82f6;
                  }
                  .itinerary-day {
                    background-color: #eff6ff;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    border-left: 4px solid #60a5fa;
                  }
                  .itinerary-activity {
                    background-color: #ffffff;
                    border-radius: 0.375rem;
                    padding: 0.75rem;
                    margin-bottom: 0.75rem;
                    border: 1px solid #e5e7eb;
                  }
                  .itinerary-cost {
                    background-color: #f0fdf4;
                    border-radius: 0.375rem;
                    padding: 0.75rem;
                    margin-bottom: 1rem;
                    border-left: 4px solid #34d399;
                  }
                  .itinerary-docs {
                    background-color: #fefce8;
                    border-radius: 0.375rem;
                    padding: 0.75rem;
                    margin-bottom: 1rem;
                    border-left: 4px solid #facc15;
                  }
                `}</style>
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderedItinerary
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Weather widget */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <icons.sun className="h-4 w-4 text-primary" />
                Clima por día
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {itinerary.map((day) => {
                const WeatherIcon = getWeatherIcon(day.weather.icon)
                return (
                  <div key={day.day} className="flex items-center justify-between">
                    <span className="text-sm">Día {day.day}</span>
                    <div className="flex items-center gap-2">
                      <WeatherIcon className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">{day.weather.temperature}°C</span>
                      <Badge variant="outline" className="text-xs">
                        {day.weather.condition}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Currency converter */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <icons.dollarSign className="h-4 w-4 text-primary" />
                Conversión rápida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center p-3 bg-muted rounded-xl">
                <p className="text-sm text-muted-foreground">Total en {resultData.planningData.currency.toUpperCase()}</p>
                <p className="text-2xl font-bold">
                  {totalBudget.toFixed(2)}{resultData.planningData.currency.toUpperCase()}
                </p>
              </div>
              <div className="text-center p-3 bg-muted rounded-xl">
                <p className="text-sm text-muted-foreground">Equivalente en USD</p>
                <p className="text-2xl font-bold">
                  ${(totalBudget * 1.08).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <icons.alertCircle className="h-4 w-4 text-primary" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">{copy.info.weatherAlert}</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">{copy.info.transportDelay}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="bg-cta hover:bg-cta-hover text-cta-foreground rounded-xl">
              <icons.sliders className="mr-2 h-4 w-4" />
              {copy.buttons.refineWithAI}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Refinar itinerario con IA</SheetTitle>
              <SheetDescription>
                Describe los cambios que te gustaría hacer y la IA ajustará tu itinerario
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="refinement">¿Qué te gustaría cambiar?</Label>
                <Textarea
                  id="refinement"
                  placeholder="Ej: Agrega más actividades gastronómicas, reduce el presupuesto, evita caminar mucho..."
                  value={refinementPrompt}
                  onChange={(e) => setRefinementPrompt(e.target.value)}
                  className="rounded-xl"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Sugerencias rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Ajusta para presupuesto bajo",
                    "Agrega más gastronomía",
                    "Menos caminata",
                    "Más actividades culturales",
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-full bg-transparent"
                      onClick={() => setRefinementPrompt(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleRefine}
                disabled={isRefining || !refinementPrompt.trim()}
                className="w-full bg-cta hover:bg-cta-hover text-cta-foreground rounded-xl"
              >
                {isRefining ? (
                  <>
                    <icons.loading className="mr-2 h-4 w-4 animate-spin" />
                    Refinando...
                  </>
                ) : (
                  "Refinar itinerario"
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Button 
          onClick={handleDownloadPDF} 
          disabled={isGeneratingPDF}
          className="bg-cta hover:bg-cta-hover text-cta-foreground rounded-xl"
        >
          {isGeneratingPDF ? (
            <>
              <icons.loading className="mr-2 h-4 w-4 animate-spin" />
              Generando PDF...
            </>
          ) : (
            <>
              <icons.download className="mr-2 h-4 w-4" />
              Descargar PDF
            </>
          )}
        </Button>

        <Button variant="outline" className="rounded-xl bg-transparent">
          <icons.save className="mr-2 h-4 w-4" />
          {copy.buttons.save}
        </Button>

        <Button onClick={handleNewPlan} className="bg-cta hover:bg-cta-hover text-cta-foreground rounded-xl">
          <icons.plus className="mr-2 h-4 w-4" />
          Nuevo plan
        </Button>
      </div>
    </div>
  )
}