export const API_BASE = `${import.meta.env.VITE_API_URL}/api/v1`

export const ENDPOINTS = {
  login:      `${API_BASE}/auth/login`,
  signup:     `${API_BASE}/usuarios`,
  userById:   (id) => `${API_BASE}/usuarios/${id}`,
}
