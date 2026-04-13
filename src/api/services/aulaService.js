/**
 * Aula Service — Real Backend API Only
 *
 * Direct API calls to Spring Boot backend without localStorage fallback.
 * Used for production operations where we want to ensure data is persisted.
 *
 * Endpoints:
 * - POST /api/v1/aulas (create)
 * - GET  /api/v1/aulas/trilha/{trilhaId} (list aulas by trilha)
 * - GET  /api/v1/aulas/{id} (get aula by id)
 * - PUT  /api/v1/aulas/{id} (update aula)
 * - DELETE /api/v1/aulas/{id} (delete aula)
 *
 * Usage:
 *   import { createAula, getAulasByTrilha } from './aulaService'
 *   const aula = await createAula({ titulo, tipo, conteudo, trilhaId })
 *   const aulas = await getAulasByTrilha(trilhaId)
 */

import { API_BASE } from './config'

// ─────────────────────────────────────────────────────────────────────────────
// API ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

const ENDPOINTS = {
  aulas: `${API_BASE}/aulas`,
  aulasByTrilha: (trilhaId) => `${API_BASE}/aulas/trilha/${trilhaId}`,
  aulaById: (id) => `${API_BASE}/aulas/${id}`,
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new aula via API
 * @param {Object} aulaData - { titulo, tipo, conteudo, trilhaId }
 * @returns {Promise<Object>} Created aula object
 */
export async function createAula(aulaData) {
  if (!aulaData.trilhaId) {
    throw new Error('ID da trilha é obrigatório')
  }

  if (!aulaData.titulo?.trim()) {
    throw new Error('Título da aula é obrigatório')
  }

  if (!aulaData.tipo) {
    throw new Error('Tipo da aula é obrigatório')
  }

  if (!aulaData.conteudo?.trim()) {
    throw new Error('Conteúdo da aula é obrigatório')
  }

  const payload = {
    titulo:   aulaData.titulo.trim(),
    tipo:     aulaData.tipo,
    conteudo: aulaData.conteudo.trim(),
    trilhaId: aulaData.trilhaId,
  }

  console.log('[aulaService] Creating aula:', payload)

  const response = await fetch(ENDPOINTS.aulas, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[aulaService] Create failed:', response.status, errorText)

    if (response.status === 400) {
      throw new Error('Dados da aula inválidos. Verifique os campos obrigatórios.')
    } else if (response.status === 404) {
      throw new Error('Trilha não encontrada.')
    } else {
      throw new Error(`Erro ao criar aula: ${response.status} ${response.statusText}`)
    }
  }

  const createdAula = await response.json()
  console.log('[aulaService] Aula created successfully:', createdAula)
  return createdAula
}

/**
 * Get aulas by trilha via API
 * @param {number} trilhaId - ID da trilha
 * @returns {Promise<Array>} Array of aula objects
 */
export async function getAulasByTrilha(trilhaId) {
  if (!trilhaId) throw new Error('ID da trilha é obrigatório')

  const url = ENDPOINTS.aulasByTrilha(trilhaId)
  console.log('[aulaService] Fetching aulas for trilha:', trilhaId)

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[aulaService] Get aulas failed:', response.status, errorText)
    throw new Error(`Erro ao carregar aulas: ${response.status} ${response.statusText}`)
  }

  const aulas = await response.json()
  console.log('[aulaService] Aulas loaded:', aulas.length, 'items')
  return aulas
}

/**
 * Get aula by ID via API
 * @param {number} id - ID da aula
 * @returns {Promise<Object>} Aula object
 */
export async function getAulaById(id) {
  if (!id) throw new Error('ID da aula é obrigatório')

  const url = ENDPOINTS.aulaById(id)
  console.log('[aulaService] Fetching aula:', id)

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[aulaService] Get aula failed:', response.status, errorText)
    throw new Error(`Erro ao carregar aula: ${response.status} ${response.statusText}`)
  }

  const aula = await response.json()
  console.log('[aulaService] Aula loaded:', aula)
  return aula
}

/**
 * Update aula via API
 * @param {number} id - ID da aula
 * @param {Object} aulaData - { titulo, tipo, conteudo }
 * @returns {Promise<Object>} Updated aula object
 */
export async function updateAula(id, aulaData) {
  if (!id) throw new Error('ID da aula é obrigatório')

  const payload = {
    titulo:   aulaData.titulo?.trim(),
    tipo:     aulaData.tipo,
    conteudo: aulaData.conteudo?.trim(),
  }

  console.log('[aulaService] Updating aula:', id, payload)

  const response = await fetch(ENDPOINTS.aulaById(id), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[aulaService] Update failed:', response.status, errorText)
    throw new Error(`Erro ao atualizar aula: ${response.status} ${response.statusText}`)
  }

  const updatedAula = await response.json()
  console.log('[aulaService] Aula updated successfully:', updatedAula)
  return updatedAula
}

/**
 * Delete aula via API
 * @param {number} id - ID da aula
 * @returns {Promise<void>}
 */
export async function deleteAula(id) {
  if (!id) throw new Error('ID da aula é obrigatório')

  console.log('[aulaService] Deleting aula:', id)

  const response = await fetch(ENDPOINTS.aulaById(id), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[aulaService] Delete failed:', response.status, errorText)
    throw new Error(`Erro ao deletar aula: ${response.status} ${response.statusText}`)
  }

  console.log('[aulaService] Aula deleted successfully')
}