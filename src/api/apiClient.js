import { STORAGE_KEYS } from '../constants/storageKeys'

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
export const API_BASE = `${BASE}/api/v1`
export const AUTH_EXPIRED_EVENT = 'sc:auth-expired'

const PUBLIC_ENDPOINTS = {
  GET: new Set([
    '/health',
    '/api/v1/auth/email-change/confirm',
  ]),
  POST: new Set([
    '/api/v1/usuarios',
    '/api/v1/auth/login',
    '/api/v1/auth/google',
    '/api/v1/auth/verify-email',
    '/api/v1/auth/resend-verification',
    '/api/v1/auth/forgot-password',
    '/api/v1/auth/reset-password',
    '/api/v1/auth/mfa/verify',
    '/api/v1/auth/email-change/request',
    '/api/v1/auth/email-change/verify',
  ]),
}

let unauthorizedSessionNotified = false

function pathFromUrl(url) {
  try {
    return new URL(url, window.location.origin).pathname
  } catch {
    return ''
  }
}

function isProtectedApiRequest(url, method) {
  const path = pathFromUrl(url)
  if (!path || !path.startsWith('/api/')) return false
  return !PUBLIC_ENDPOINTS[method]?.has(path)
}

export function storeAccessToken(accessToken, expiresIn) {
  const lifetimeSeconds = Number(expiresIn)
  if (!accessToken || !Number.isFinite(lifetimeSeconds) || lifetimeSeconds <= 0) {
    throw new Error('Resposta de autenticacao invalida. Faca login novamente.')
  }
  sessionStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
  sessionStorage.setItem(STORAGE_KEYS.tokenExpiresAt, String(Date.now() + lifetimeSeconds * 1000))
  unauthorizedSessionNotified = false
}

export function clearAccessToken() {
  sessionStorage.removeItem(STORAGE_KEYS.accessToken)
  sessionStorage.removeItem(STORAGE_KEYS.tokenExpiresAt)
}

export function getAccessToken() {
  const accessToken = sessionStorage.getItem(STORAGE_KEYS.accessToken)
  const expiresAt = Number(sessionStorage.getItem(STORAGE_KEYS.tokenExpiresAt))
  if (!accessToken || !Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
    clearAccessToken()
    return null
  }
  return accessToken
}

function notifyUnauthorizedSession() {
  clearAccessToken()
  if (unauthorizedSessionNotified) return
  unauthorizedSessionNotified = true
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
}

export const ENDPOINTS = {
  // Auth
  login:    `${API_BASE}/auth/login`,
  signup:   `${API_BASE}/usuarios`,
  userById: (id) => `${API_BASE}/usuarios/${id}`,
  usuarios: `${API_BASE}/usuarios`,

  // Trilhas
  trilhas:        `${API_BASE}/trilhas`,
  trilhaById:     (id) => `${API_BASE}/trilhas/${id}`,
  trilhasByProf:  (professorId) => `${API_BASE}/trilhas?professorId=${professorId}`,

  // Aulas
  aulas:          `${API_BASE}/aulas`,
  aulasByTrilha:  (trilhaId) => `${API_BASE}/aulas/trilha/${trilhaId}`,
  aulaById:       (id) => `${API_BASE}/aulas/${id}`,

  // Matrículas
  matriculas:                  `${API_BASE}/matriculas`,
  matriculasByAluno:           (alunoId)   => `${API_BASE}/matriculas/aluno/${alunoId}`,
  matriculasByTrilha:          (trilhaId)  => `${API_BASE}/matriculas/trilha/${trilhaId}`,
  matriculasResumoProfessor:   (profId)    => `${API_BASE}/matriculas/professor/${profId}/resumo`,
  matriculaDelete:             (trilhaId, alunoId) => `${API_BASE}/matriculas/${trilhaId}/aluno/${alunoId}`,
  matriculaExiste:             (alunoId, trilhaId) => `${API_BASE}/matriculas/existe?alunoId=${alunoId}&trilhaId=${trilhaId}`,

  // Progresso
  progressoConcluir:           `${API_BASE}/progresso/concluir`,
  progressoAluno:              (alunoId)           => `${API_BASE}/progresso/aluno/${alunoId}`,
  progressoAlunoIds:           (alunoId)           => `${API_BASE}/progresso/aluno/${alunoId}/ids`,
  progressoTrilhaAluno:        (trilhaId, alunoId) => `${API_BASE}/progresso/trilha/${trilhaId}/aluno/${alunoId}`,

  // Perfil de aprendizado
  perfilAprendizado:           (alunoId) => `${API_BASE}/perfil-aprendizado/${alunoId}`,
  perfilAprendizadoCreate:     `${API_BASE}/perfil-aprendizado`,

  // Verificação de e-mail
  verifyEmail:          `${API_BASE}/auth/verify-email`,
  resendVerification:   `${API_BASE}/auth/resend-verification`,

  // Google OAuth2
  googleAuth:           `${API_BASE}/auth/google`,

  // Troca de e-mail (2 etapas)
  emailChangeRequest:   `${API_BASE}/auth/email-change/request`,
  emailChangeConfirm:   (token) => `${API_BASE}/auth/email-change/confirm?token=${token}`,
  emailChangeVerify:    `${API_BASE}/auth/email-change/verify`,

  // MFA
  mfaVerify:  `${API_BASE}/auth/mfa/verify`,
  mfaEnable:  `${API_BASE}/auth/mfa/enable`,
  mfaDisable: `${API_BASE}/auth/mfa/disable`,
  deleteChallenge: (id) => `${API_BASE}/usuarios/${id}/delete-challenge`,

  // Trilhas privadas
  trilhaCodigo:          (id) => `${API_BASE}/trilhas/${id}/codigo`,
  trilhaCodigoRegenerar: (id) => `${API_BASE}/trilhas/${id}/codigo/regenerar`,
  trilhaAcesso:          (id) => `${API_BASE}/trilhas/${id}/acesso`,

  // Recuperação de senha
  forgotPassword: `${API_BASE}/auth/forgot-password`,
  resetPassword:  `${API_BASE}/auth/reset-password`,

  // Dúvidas
  duvidas:                     `${API_BASE}/duvidas`,
  duvidaResponder:             (id) => `${API_BASE}/duvidas/${id}/responder`,
  duvidaResolver:              (id) => `${API_BASE}/duvidas/${id}/resolver`,
  duvidasByTrilha:             (trilhaId) => `${API_BASE}/duvidas/trilha/${trilhaId}`,
  duvidasByAula:               (aulaId)   => `${API_BASE}/duvidas/aula/${aulaId}`,
  duvidasByAlunoEAula:         (alunoId, aulaId) => `${API_BASE}/duvidas/aluno/${alunoId}/aula/${aulaId}`,

  // Estatísticas da trilha
  estatisticasTrilha:          (trilhaId) => `${API_BASE}/matriculas/trilha/${trilhaId}/estatisticas`,

  // Tickets de suporte
  tickets:       `${API_BASE}/tickets`,
  ticketById:    (id) => `${API_BASE}/tickets/${id}`,
  ticketsByUser: (userId) => `${API_BASE}/tickets/usuario/${userId}`,

  // Solicitação de professor
  solicitacoesProfessor:        `${API_BASE}/solicitacoes-professor`,
  solicitacoesMinhas:           `${API_BASE}/solicitacoes-professor/minhas`,
  solicitacaoById:              (id) => `${API_BASE}/solicitacoes-professor/${id}`,
  solicitacaoAprovar:           (id) => `${API_BASE}/solicitacoes-professor/${id}/aprovar`,
  solicitacaoReprovar:          (id) => `${API_BASE}/solicitacoes-professor/${id}/reprovar`,
}

export const ROLE_MAP = {
  ADMIN:     'admin',
  PROFESSOR: 'teacher',
  ALUNO:     'student',
}

export async function api(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const protectedRequest = isProtectedApiRequest(url, method)
  const accessToken = protectedRequest ? getAccessToken() : null

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    if (res.status === 401 && protectedRequest) notifyUnauthorizedSession()
    const text = await res.text().catch(() => '')
    let message = text || `HTTP ${res.status}`
    try {
      const parsed = JSON.parse(text)
      message = parsed.error || parsed.message || message
    } catch {
      // Keep the raw response text when it is not JSON.
    }
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  if (res.status === 204) return null
  const text = await res.text()
  if (!text || !text.trim()) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
