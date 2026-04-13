/**
 * Service layer configuration.
 *
 * USE_MOCK = false → Use real API (production mode)
 * USE_MOCK = true  → Always use localStorage (demo mode)
 */

export const USE_MOCK = false  // ← PRODUCTION MODE: Use real API only

/**
 * Simulates network delay (300–800ms random).
 * Only used when USE_MOCK=true.
 */
export async function simulateNetworkDelay() {
  const delay = Math.random() * 500 + 300  // 300–800ms
  return new Promise(resolve => setTimeout(resolve, delay))
}

/**
 * Backend API configuration (used when USE_MOCK=false).
 * Mirrors the structure from src/api/config.js but re-exported here for convenience.
 */
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
export const API_BASE = `${BASE}/api/v1`

export const ENDPOINTS = {
  login:    `${API_BASE}/auth/login`,
  signup:   `${API_BASE}/usuarios`,
  userById: (id) => `${API_BASE}/usuarios/${id}`,
  
  // Trilha endpoints
  trilhas:              `${API_BASE}/trilhas`,
  trilhaById: (id)      => `${API_BASE}/trilhas/${id}`,
  minhasTrilhas:        `${API_BASE}/trilhas/minhas`,
}

/**
 * Role mapping: backend returns uppercase, we normalize to lowercase.
 */
export const ROLE_MAP = {
  ADMIN:     'admin',
  PROFESSOR: 'teacher',
  ALUNO:     'student',
}
