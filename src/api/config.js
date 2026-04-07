export const API_BASE = 'http://localhost:8080/api/v1'

export const ENDPOINTS = {
  login:      `${API_BASE}/auth/login`,
  signup:     `${API_BASE}/usuarios`,
  userById:   (id) => `${API_BASE}/usuarios/${id}`,
}
