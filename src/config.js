// Endpoints del backend (Spring Boot). Se pueden sobreescribir con variables
// de entorno de Vite (VITE_API_BASE / VITE_WS_URL) sin tocar el código.
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'
export const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080/ws'
