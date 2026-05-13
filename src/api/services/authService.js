/**
 * Authentication Service
 * 
 * ✅ CRITICAL: Authentication ALWAYS uses the real backend.
 * There is NO mock mode for auth - USE_MOCK is not used here.
 * 
 * All responses are validated for required fields before returning.
 * Errors are in Portuguese for user-friendly display.
 * 
 * Usage:
 *   import { authService } from './authService'
 *   const userData = await authService.login({ email, senha })
 *   // Returns: { id, nome, role: 'ADMIN' | 'PROFESSOR' | 'ALUNO' }
 */

import { ENDPOINTS } from './config'

// ─────────────────────────────────────────────────────────────────────────────
// REAL API IMPLEMENTATIONS (NO MOCK MODE FOR AUTH)
// ─────────────────────────────────────────────────────────────────────────────

async function login({ email, senha }) {
  console.log('[authService.login] Calling:', ENDPOINTS.login)
  
  const res = await fetch(ENDPOINTS.login, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  })

  console.log('[authService.login] Response status:', res.status)
  
  if (!res.ok) {
    if (res.status === 401) {
      console.warn('[authService.login] Invalid credentials')
      throw new Error('E-mail ou senha incorretos.')
    }
    console.error('[authService.login] Server error:', res.status)
    throw new Error('Erro no servidor. Tente novamente.')
  }

  const data = await res.json()
  console.log('[authService.login] Success. User:', { id: data.id, nome: data.nome, role: data.role })
  
  // Validate required fields
  if (!data.id || !data.nome || !data.role) {
    console.error('[authService.login] Invalid response - missing required fields:', data)
    throw new Error('Resposta do servidor inválida. Contate o suporte.')
  }

  return data  // { id, nome, role: 'ADMIN' | 'PROFESSOR' | 'ALUNO' }
}

async function signup({ nome, email, senha, tipoUsuario = 'ALUNO' }) {
  console.log('[authService.signup] Calling:', ENDPOINTS.signup)
  
  const res = await fetch(ENDPOINTS.signup, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha, tipoUsuario, ativo: true }),
  })

  console.log('[authService.signup] Response status:', res.status)
  
  if (!res.ok) {
    if (res.status === 409) {
      console.warn('[authService.signup] Email already exists')
      throw new Error('Este e-mail já está cadastrado.')
    }
    console.error('[authService.signup] Server error:', res.status)
    throw new Error('Não foi possível criar sua conta. Tente novamente.')
  }

  console.log('[authService.signup] Account created. Auto-logging in...')
  
  // After signup, auto-login with same credentials
  return login({ email, senha })
}

async function updateUser(userId, { nome, email, tipoUsuario, senha }) {
  if (!userId) {
    console.error('[authService.updateUser] user.id is missing')
    throw new Error('Sessão inválida. Faça login novamente.')
  }

  console.log('[authService.updateUser] Calling:', ENDPOINTS.userById(userId))
  
  const res = await fetch(ENDPOINTS.userById(userId), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, tipoUsuario, ativo: true, senha }),
  })

  console.log('[authService.updateUser] Response status:', res.status)
  
  if (!res.ok) {
    if (res.status === 409) {
      console.warn('[authService.updateUser] Email already in use')
      throw new Error('Este e-mail já está em uso.')
    }
    console.error('[authService.updateUser] Server error:', res.status)
    const errorText = await res.text()
    console.error('[authService.updateUser] Error response:', errorText)
    throw new Error('Não foi possível salvar as alterações. Tente novamente.')
  }

  const data = await res.json()
  console.log('[authService.updateUser] Success')
  return data
}

async function changePassword(userId, { nome, email, tipoUsuario, senha }) {
  if (!userId) {
    console.error('[authService.changePassword] user.id is missing')
    throw new Error('Sessão inválida. Faça login novamente.')
  }

  console.log('[authService.changePassword] Calling:', ENDPOINTS.userById(userId))
  
  const res = await fetch(ENDPOINTS.userById(userId), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, tipoUsuario, ativo: true, senha }),
  })

  console.log('[authService.changePassword] Response status:', res.status)
  
  if (!res.ok) {
    console.error('[authService.changePassword] Server error:', res.status)
    throw new Error('Não foi possível alterar a senha. Tente novamente.')
  }

  const data = await res.json()
  console.log('[authService.changePassword] Success')
  return data
}

async function deleteUser(userId) {
  if (!userId) {
    console.error('[authService.deleteUser] user.id is missing')
    throw new Error('Sessão inválida. Faça login novamente.')
  }

  console.log('[authService.deleteUser] Calling:', ENDPOINTS.userById(userId))
  
  const res = await fetch(ENDPOINTS.userById(userId), {
    method: 'DELETE',
  })

  console.log('[authService.deleteUser] Response status:', res.status)
  
  if (!res.ok) {
    console.error('[authService.deleteUser] Server error:', res.status)
    throw new Error('Não foi possível excluir a conta. Tente novamente.')
  }

  // Some backends return 204 No Content on DELETE.
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    console.log('[authService.deleteUser] Success (no content)')
    return null
  }

  const text = await res.text()
  if (!text) {
    console.log('[authService.deleteUser] Success (empty body)')
    return null
  }

  try {
    const data = JSON.parse(text)
    console.log('[authService.deleteUser] Success')
    return data
  } catch (err) {
    console.warn('[authService.deleteUser] Response body is not JSON, ignoring body')
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API - ALWAYS REAL BACKEND (NO MOCK MODE)
// ─────────────────────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Login with email and password.
   * ✅ ALWAYS uses real backend (no mock)
   * @param {string} email
   * @param {string} senha
   * @returns {Promise<{id, nome, role}>}
   */
  login,

  /**
   * Signup with name, email, and password.
   * Creates account then auto-logs in via real backend.
   * ✅ ALWAYS uses real backend (no mock)
   * @param {string} nome
   * @param {string} email
   * @param {string} senha
   * @param {string} tipoUsuario (optional, default 'ALUNO')
   * @returns {Promise<{id, nome, role}>}
   */
  signup,

  /**
   * Update user profile (name and email).
   * @param {string} userId
   * @param {string} nome
   * @param {string} email
   * @param {string} tipoUsuario
   * @returns {Promise<void>}
   */
  updateUser,

  /**
   * Change password.
   * @param {string} userId
   * @param {string} nome
   * @param {string} email
   * @param {string} tipoUsuario
   * @param {string} senha
   * @returns {Promise<void>}
   */
  changePassword,

  /**
   * Delete user account.
   * @param {string} userId
   * @returns {Promise<void>}
   */
  deleteUser,
}
