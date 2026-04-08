/**
 * Turma Service — Real Backend API Only
 *
 * Direct API calls to Spring Boot backend without localStorage fallback.
 * Used for production operations where we want to ensure data is persisted.
 *
 * Endpoints:
 * - POST /api/v1/turmas (create)
 * - GET  /api/v1/turmas (list all)
 * - GET  /api/v1/turmas/minhas (list user's classes)
 *
 * Usage:
 *   import { createTurma, getTurmas } from './turmaService'
 *   const turma = await createTurma({ nome, descricao, codigo, tipo, nivel, professor_id })
 *   const turmas = await getTurmas()
 */

import { API_BASE } from './config'

// ─────────────────────────────────────────────────────────────────────────────
// API ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

const ENDPOINTS = {
  turmas: `${API_BASE}/turmas`,
  minhasTurmas: `${API_BASE}/turmas/minhas`,
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new turma via API
 * @param {Object} turmaData - { nome, descricao, codigo, tipo, nivel, professor_id }
 * @returns {Promise<Object>} Created turma object
 */
export async function createTurma(turmaData) {
  if (!turmaData.professorId) {
    throw new Error('ID do professor é obrigatório')
  }

  if (!turmaData.nome?.trim()) {
    throw new Error('Nome da turma é obrigatório')
  }

  if (!turmaData.tipo) {
    throw new Error('Tipo da turma é obrigatório')
  }

  if (!turmaData.nivel) {
    throw new Error('Nível da turma é obrigatório')
  }

  const payload = {
    nome:          turmaData.nome.trim(),
    descricao:     turmaData.descricao?.trim() || '',
    codigo:        turmaData.codigo?.trim() || generateClassCode(turmaData.disciplina || 'GERAL'),
    tipo:          turmaData.tipo,
    nivel:         turmaData.nivel,
    professorId:   turmaData.professorId,
    professorNome: turmaData.professorNome || 'Professor',
  }

  console.log('[turmaService] Creating turma:', payload)

  const response = await fetch(ENDPOINTS.turmas, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[turmaService] Create failed:', response.status, errorText)

    if (response.status === 400) {
      throw new Error('Dados da turma inválidos. Verifique os campos obrigatórios.')
    } else if (response.status === 409) {
      throw new Error('Este código de turma já está em uso. Tente outro código.')
    } else if (response.status === 404) {
      throw new Error('Professor não encontrado. Faça login novamente.')
    } else {
      throw new Error(`Erro ao criar turma: ${response.status} ${response.statusText}`)
    }
  }

  const createdTurma = await response.json()
  console.log('[turmaService] Turma created successfully:', createdTurma)
  return createdTurma
}

/**
 * Get all turmas via API
 * @returns {Promise<Array>} Array of turma objects
 */
export async function getTurmas() {
  console.log('[turmaService] Fetching all turmas')

  const response = await fetch(ENDPOINTS.turmas, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[turmaService] Get turmas failed:', response.status, errorText)
    throw new Error(`Erro ao carregar turmas: ${response.status} ${response.statusText}`)
  }

  const turmas = await response.json()
  console.log('[turmaService] Turmas loaded:', turmas.length, 'items')
  return turmas
}

/**
 * Get user's turmas via API
 * @param {number} professorId - ID do professor logado
 * @returns {Promise<Array>} Array of user's turma objects
 */
export async function getMyTurmas(professorId) {
  if (!professorId) throw new Error('ID do professor é obrigatório')
  const url = `${ENDPOINTS.minhasTurmas}?professorId=${professorId}`
  console.log('[turmaService] Fetching my turmas:', url)

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[turmaService] Get my turmas failed:', response.status, errorText)
    throw new Error(`Erro ao carregar suas turmas: ${response.status} ${response.statusText}`)
  }

  const turmas = await response.json()
  console.log('[turmaService] My turmas loaded:', turmas.length, 'items')
  return turmas
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a unique class code
 * Format: SUBJECT-LEVEL-RANDOM (e.g., MAT-3A-7X2K)
 */
function generateClassCode(subject = 'GERAL') {
  const subjectCode = subject.substring(0, 3).toUpperCase()
  const levelCode = 'GEN' // Generic level since we don't have specific level info
  const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `${subjectCode}-${levelCode}-${randomCode}`
}