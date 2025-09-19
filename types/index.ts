// Tipos principales para la aplicación de viajesmart

// Tipos para el itinerario
export interface Itinerary {
  id: string;
  destination: string;
  duration: number; // Renombrado de 'days' a 'duration' para evitar conflicto
  budget: number;
  travelStyle: string;
  preferences: string[];
  createdAt: Date;
  updatedAt: Date;
  days: ItineraryDay[];
  totalEstimatedCost: number;
  tips: string[];
}

export interface ItineraryDay {
  dayNumber: number;
  date: Date;
  activities: Activity[];
  meals: Meal[];
  accommodation?: Accommodation;
  transportation: Transportation[];
  estimatedCost: number;
  notes: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  location: Location;
  startTime: string;
  endTime: string;
  cost: number;
  category: ActivityCategory;
  tips: string[];
  bookingRequired: boolean;
  bookingUrl?: string;
  images: string[];
  rating?: number;
  reviews?: Review[];
}

export interface Meal {
  id: string;
  name: string;
  type: MealType;
  restaurant: string;
  location: Location;
  cost: number;
  cuisine: string;
  description: string;
  rating?: number;
  reviews?: Review[];
  images: string[];
}

export interface Accommodation {
  id: string;
  name: string;
  type: AccommodationType;
  location: Location;
  costPerNight: number;
  rating: number;
  amenities: string[];
  description: string;
  checkIn: string;
  checkOut: string;
  bookingUrl?: string;
  images: string[];
  reviews?: Review[];
}

export interface Transportation {
  id: string;
  type: TransportationType;
  from: Location;
  to: Location;
  cost: number;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  provider: string;
  bookingUrl?: string;
  instructions: string;
}

export interface Location {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  city: string;
  country: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: Date;
}

// Tipos para búsqueda
export interface SearchQuery {
  destination: string;
  preferences: string[];
  dates: {
    start: Date;
    end: Date;
  };
  travelers: number;
  budget: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  type: SearchResultType;
  relevanceScore: number;
  metadata: Record<string, any>;
}

// Tipos para scraping
export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  excerpt: string;
  wordCount: number;
  metadata: Record<string, any>;
  structuredData: any[];
  images: string[];
  links: string[];
  scrapedAt: Date;
}

// Tipos para chat con IA
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  itineraryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para usuario
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserPreferences {
  language: 'es' | 'en';
  currency: string;
  travelStyle: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  notifications: {
    email: boolean;
    push: boolean;
  };
}

// Enums
export enum ActivityCategory {
  SIGHTSEEING = 'sightseeing',
  ADVENTURE = 'adventure',
  CULTURE = 'culture',
  FOOD = 'food',
  SHOPPING = 'shopping',
  NATURE = 'nature',
  ENTERTAINMENT = 'entertainment',
  RELAXATION = 'relaxation',
  SPORTS = 'sports',
  NIGHTLIFE = 'nightlife'
}

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  DRINKS = 'drinks'
}

export enum AccommodationType {
  HOTEL = 'hotel',
  HOSTEL = 'hostel',
  APARTMENT = 'apartment',
  HOUSE = 'house',
  RESORT = 'resort',
  CAMPING = 'camping',
  GUESTHOUSE = 'guesthouse'
}

export enum TransportationType {
  FLIGHT = 'flight',
  TRAIN = 'train',
  BUS = 'bus',
  CAR = 'car',
  TAXI = 'taxi',
  BOAT = 'boat',
  METRO = 'metro',
  WALKING = 'walking',
  BIKE = 'bike'
}

export enum SearchResultType {
  ACTIVITY = 'activity',
  RESTAURANT = 'restaurant',
  HOTEL = 'hotel',
  ATTRACTION = 'attraction',
  TRANSPORTATION = 'transportation',
  ARTICLE = 'article',
  REVIEW = 'review'
}

// Tipos para API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para eventos SSE
export interface SSEEvent<T = any> {
  type: string;
  data: T;
  timestamp: Date;
  id: string;
}

export interface ItineraryGenerationProgress {
  stage: 'searching' | 'scraping' | 'generating' | 'finalizing';
  progress: number; // 0-100
  message: string;
  eta?: number; // Tiempo estimado en milisegundos
}

// Tipos para errores
export interface AppError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

// Tipos para configuración
export interface AppConfig {
  api: {
    openRouter: {
      apiKey: string;
      baseUrl: string;
      model: string;
    };
    serpApi: {
      apiKey: string;
    };
  };
  app: {
    name: string;
    url: string;
    version: string;
  };
  features: {
    enableSSE: boolean;
    enableNotifications: boolean;
    maxSearchResults: number;
  };
}