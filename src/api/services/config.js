/**
 * Service layer configuration.
 * 
 * Toggle USE_MOCK between true|false to switch between mock and real backend.
 * When USE_MOCK=true: services return mock data after simulated delay
 * When USE_MOCK=false: services make real fetch() calls to backend via ENDPOINTS
 */

export const USE_MOCK = true  // ← SET TO FALSE TO USE REAL BACKEND

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
  
  // Class endpoints
  classes:           `${API_BASE}/turmas`,
  createClass:       `${API_BASE}/turmas`,
  classById: (id)    => `${API_BASE}/turmas/${id}`,
  myClasses:         `${API_BASE}/turmas/minhas`,
  joinClass:         `${API_BASE}/turmas/entrar`,
  leaveClass: (id)   => `${API_BASE}/turmas/${id}/sair`,
  classMembers: (id) => `${API_BASE}/turmas/${id}/membros`,
  addMessage: (id)   => `${API_BASE}/turmas/${id}/mural/mensagem`,
  addActivity: (id)  => `${API_BASE}/turmas/${id}/mural/atividade`,
}

/**
 * Role mapping: backend returns uppercase, we normalize to lowercase.
 */
export const ROLE_MAP = {
  ADMIN:     'admin',
  PROFESSOR: 'teacher',
  ALUNO:     'student',
}
