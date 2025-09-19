// Microcopy centralizado para PlanesyGo (ES)
export const copy = {
  // Navegación y acciones principales
  nav: {
    home: "Inicio",
    plan: "Planear",
    results: "Resultados",
    saved: "Guardados",
    settings: "Configuración",
    profile: "Perfil",
    logout: "Cerrar sesión",
  },

  // Botones y CTAs
  buttons: {
    planTrip: "Planear viaje",
    generateItinerary: "Generar itinerario",
    refineWithAI: "Refinar con IA",
    save: "Guardar",
    export: "Exportar",
    login: "Ingresar",
    signup: "Crear cuenta",
    back: "Atrás",
    next: "Siguiente",
    retry: "Reintentar",
    viewOnMap: "Ver en mapa",
    duplicate: "Duplicar",
    delete: "Eliminar",
  },

  // Placeholders
  placeholders: {
    searchCity: "Busca una ciudad, país o punto de interés…",
    email: "tu@email.com",
    password: "Tu contraseña",
    budget: "Presupuesto estimado",
  },

  // Mensajes de ayuda
  help: {
    preferences: "Usamos tus preferencias para personalizar actividades, rutas y costos estimados.",
    budget: "Incluye alojamiento, comida, transporte y actividades",
    style: "Selecciona los tipos de experiencias que más te interesan",
    transport: "Optimizamos las rutas según tu preferencia de comodidad vs precio",
  },

  // Estados de carga
  loading: {
    analyzing: "Analizando preferencias",
    calculating: "Calculando rutas",
    estimating: "Estimando costos",
    compiling: "Compilando resultados",
    generating: "Generando itinerario...",
  },

  // Mensajes de error
  errors: {
    mapLoad: "No pudimos cargar el mapa. Reintenta o verifica tu conexión.",
    invalidCredentials: "Credenciales inválidas",
    weatherUnavailable: "No se pudo obtener el clima",
    networkError: "Error de conexión. Verifica tu internet.",
    generic: "Algo salió mal. Por favor intenta de nuevo.",
  },

  // Mensajes de éxito
  success: {
    itinerarySaved: "Itinerario guardado",
    profileUpdated: "Perfil actualizado",
    preferencesUpdated: "Preferencias guardadas",
  },

  // Información
  info: {
    newRecommendations: "Nuevas recomendaciones disponibles",
    weatherAlert: "Lluvia ligera por la tarde",
    transportDelay: "Demora en bus 30 min",
  },

  // Onboarding
  onboarding: {
    welcome: "¡Bienvenido a PlanesyGo!",
    subtitle: "Genera itinerarios personalizados con IA",
    getStarted: "Comenzar a planear",
    firstTime: "Parece que es tu primera vez aquí",
  },
} as const
