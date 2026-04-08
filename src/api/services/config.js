/**
 * Service layer configuration with incremental API migration support.
 * 
 * STRATEGY:
 *   Phase 1 (Current): Hybrid mode - CRUD operations try API first, fallback to localStorage
 *   Phase 2 (Future): API-first mode - All operations use real API
 *   Phase 3 (Final): Backend-only - Remove localStorage completely
 * 
 * HOW IT WORKS:
 *   - USE_MOCK controls the fallback behavior in classService
 *   - USE_MOCK = true  → Always use localStorage (safe, demo mode)
 *   - USE_MOCK = false → Try API first, fallback to localStorage (current production)
 *   
 * MIGRATED OPERATIONS (API with automatic fallback):
 *   ✅ createClass()
 *   ✅ getClassById()
 *   ✅ getClassesByUser()
 *   ✅ joinClass()
 *   ✅ leaveClass()
 * 
 * NOT YET MIGRATED (Still using localStorage):
 *   📦 addMessageToMural() - Will migrate in Phase 2
 *   📦 addActivityToMural() - Will migrate in Phase 2
 *   📦 All comment operations - Will migrate in Phase 2
 *   📦 Member management operations - Will migrate in Phase 2
 *
 * SET THIS TO CONTROL BACKEND:
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
