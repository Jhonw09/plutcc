// In dev the Vite proxy forwards /api/* to localhost:8080, so no base URL is needed.
// In production VITE_API_URL must be set to the deployed backend (e.g. on Render/Railway).
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export const API_BASE = `${BASE}/api/v1`

export const ENDPOINTS = {
  login:    `${API_BASE}/auth/login`,
  signup:   `${API_BASE}/usuarios`,
  userById: (id) => `${API_BASE}/usuarios/${id}`,
}
