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

const ENDPOINTS = {
  aulas: `${API_BASE}/aulas`,
  aulasByTrilha: (trilhaId) => `${API_BASE}/aulas/trilha/${trilhaId}`,
  aulaById: (id) => `${API_BASE}/aulas/${id}`,
}

// Converte blocos do frontend (array flat) → envelope { versao, blocos[] }
function toEnvelope(blocos) {
  return {
    versao: 1,
    blocos: blocos.map((b, i) => ({ ...b, ordem: i + 1 })),
  }
}

// Converte envelope do backend → array flat de blocos (compatível com AulaEditor)
function fromEnvelope(envelope) {
  if (!envelope?.blocos) return []
  return [...envelope.blocos].sort((a, b) => a.ordem - b.ordem)
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
  if (!aulaData.trilhaId) throw new Error('ID da trilha é obrigatório')
  if (!aulaData.titulo?.trim()) throw new Error('Título da aula é obrigatório')

  const payload = {
    titulo:   aulaData.titulo.trim(),
    trilhaId: aulaData.trilhaId,
    blocos:   toEnvelope(aulaData.blocos ?? []),
  }

  const response = await fetch(ENDPOINTS.aulas, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    if (response.status === 400) throw new Error('Dados da aula inválidos: ' + errorText)
    if (response.status === 404) throw new Error('Trilha não encontrada.')
    throw new Error(`Erro ao criar aula: ${response.status}`)
  }

  const created = await response.json()
  return { ...created, blocos: fromEnvelope(created.blocos) }
}

/**
 * Get aulas by trilha via API
 * @param {number} trilhaId - ID da trilha
 * @returns {Promise<Array>} Array of aula objects
 */
export async function getAulasByTrilha(trilhaId) {
  if (!trilhaId) throw new Error('ID da trilha é obrigatório')

  const response = await fetch(ENDPOINTS.aulasByTrilha(trilhaId), {
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) throw new Error(`Erro ao carregar aulas: ${response.status}`)

  const aulas = await response.json()
  return aulas.map(a => ({ ...a, blocos: fromEnvelope(a.blocos) }))
}

/**
 * Get aula by ID via API
 * @param {number} id - ID da aula
 * @returns {Promise<Object>} Aula object
 */
export async function getAulaById(id) {
  if (!id) throw new Error('ID da aula é obrigatório')

  const response = await fetch(ENDPOINTS.aulaById(id), {
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) throw new Error(`Erro ao carregar aula: ${response.status}`)

  const aula = await response.json()
  return { ...aula, blocos: fromEnvelope(aula.blocos) }
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
    titulo:  aulaData.titulo?.trim(),
    blocos:  toEnvelope(aulaData.blocos ?? []),
  }

  const response = await fetch(ENDPOINTS.aulaById(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) throw new Error(`Erro ao atualizar aula: ${response.status}`)

  const updated = await response.json()
  return { ...updated, blocos: fromEnvelope(updated.blocos) }
}

/**
 * Delete aula via API
 * @param {number} id - ID da aula
 * @returns {Promise<void>}
 */
export async function deleteAula(id) {
  if (!id) throw new Error('ID da aula é obrigatório')

  const response = await fetch(ENDPOINTS.aulaById(id), { method: 'DELETE' })

  if (!response.ok) throw new Error(`Erro ao deletar aula: ${response.status}`)
}