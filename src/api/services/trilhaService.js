/**
 * Trilha Service — Real Backend API Only
 *
 * Direct API calls to Spring Boot backend without localStorage fallback.
 * Used for production operations where we want to ensure data is persisted.
 *
 * Endpoints:
 * - POST /api/v1/trilhas (create)
 * - GET  /api/v1/trilhas (list all)
 * - GET  /api/v1/trilhas/minhas (list user's trilhas)
 *
 * Usage:
 *   import { createTrilha, getTrilhas } from './trilhaService'
 *   const trilha = await createTrilha({ nome, descricao, tipo, nivel, professor_id })
 *   const trilhas = await getTrilhas()
 */

import { API_BASE } from './config'

// ─────────────────────────────────────────────────────────────────────────────
// API ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

const ENDPOINTS = {
  trilhas: `${API_BASE}/trilhas`,
  minhasTrilhas: `${API_BASE}/trilhas/minhas`,
  trilhaById: (id) => `${API_BASE}/trilhas/${id}`,
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new trilha via API
 * @param {Object} trilhaData - { nome, descricao, tipo, nivel, professor_id }
 * @returns {Promise<Object>} Created trilha object
 */
export async function createTrilha(trilhaData) {
  if (!trilhaData.professorId) {
    throw new Error('ID do professor é obrigatório')
  }

  if (!trilhaData.nome?.trim()) {
    throw new Error('Nome da trilha é obrigatório')
  }

  if (!trilhaData.tipo) {
    throw new Error('Tipo da trilha é obrigatório')
  }

  if (!trilhaData.nivel) {
    throw new Error('Nível da trilha é obrigatório')
  }

  const payload = {
    nome:          trilhaData.nome.trim(),
    descricao:     trilhaData.descricao?.trim() || '',
    tipo:          trilhaData.tipo,
    nivel:         trilhaData.nivel,
    professorId:   trilhaData.professorId,
    professorNome: trilhaData.professorNome || 'Professor',
  }

  console.log('[trilhaService] Creating trilha:', payload)

  const response = await fetch(ENDPOINTS.trilhas, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[trilhaService] Create failed:', response.status, errorText)

    if (response.status === 400) {
      throw new Error('Dados da trilha inválidos. Verifique os campos obrigatórios.')
    } else if (response.status === 409) {
      throw new Error('Esta trilha já existe.')
    } else if (response.status === 404) {
      throw new Error('Professor não encontrado. Faça login novamente.')
    } else {
      throw new Error(`Erro ao criar trilha: ${response.status} ${response.statusText}`)
    }
  }

  const createdTrilha = await response.json()
  console.log('[trilhaService] Trilha created successfully:', createdTrilha)
  return createdTrilha
}

/**
 * Get all trilhas via API
 * @returns {Promise<Array>} Array of trilha objects
 */
export async function getTrilhas() {
  console.log('[trilhaService] Fetching all trilhas')

  const response = await fetch(ENDPOINTS.trilhas, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[trilhaService] Get trilhas failed:', response.status, errorText)
    throw new Error(`Erro ao carregar trilhas: ${response.status} ${response.statusText}`)
  }

  const trilhas = await response.json()
  console.log('[trilhaService] Trilhas loaded:', trilhas.length, 'items')
  return trilhas
}

/**
 * Get trilha by ID via API
 * @param {number} id - ID da trilha
 * @returns {Promise<Object>} Trilha object
 */
export async function getTrilhaById(id) {
  if (!id) throw new Error('ID da trilha é obrigatório')

  const url = ENDPOINTS.trilhaById(id)
  console.log('[trilhaService] Fetching trilha:', id)

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[trilhaService] Get trilha failed:', response.status, errorText)
    throw new Error(`Erro ao carregar trilha: ${response.status} ${response.statusText}`)
  }

  const trilha = await response.json()
  console.log('[trilhaService] Trilha loaded:', trilha)
  return trilha
}
/**
 * Get user's trilhas via API
 * @param {number} professorId - ID do professor logado
 * @returns {Promise<Array>} Array of user's trilha objects
 */
export async function getMyTrilhas(professorId) {
  if (!professorId) throw new Error('ID do professor é obrigatório')
  const url = `${ENDPOINTS.minhasTrilhas}?professorId=${professorId}`
  console.log('[trilhaService] Fetching my trilhas:', url)

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[trilhaService] Get my trilhas failed:', response.status, errorText)
    throw new Error(`Erro ao carregar suas trilhas: ${response.status} ${response.statusText}`)
  }

  const trilhas = await response.json()
  console.log('[trilhaService] My trilhas loaded:', trilhas.length, 'items')
  return trilhas
}

export async function deleteTrilha(id, professorId) {
  if (!id) throw new Error('ID da trilha é obrigatório')
  if (!professorId) throw new Error('ID do professor é obrigatório')
  const response = await fetch(`${ENDPOINTS.trilhaById(id)}?professorId=${professorId}`, { method: 'DELETE' })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ao excluir trilha: ${response.status} ${errorText}`)
  }
}