export const API_BASE = 'https://studyconnect-8bfr.onrender.com/api/v1'

export const ENDPOINTS = {
  login:      `${API_BASE}/auth/login`,
  signup:     `${API_BASE}/usuarios`,
  userById:   (id) => `${API_BASE}/usuarios/${id}`,
}
