import { createContext, useContext, useState } from 'react'
import { ENDPOINTS } from '../api/config'
import { STORAGE_KEYS } from '../constants/storageKeys'

const AuthContext = createContext(null)

// Backend roles → frontend roles
const ROLE_MAP = {
  ADMIN:     'admin',
  PROFESSOR: 'teacher',
  ALUNO:     'student',
}

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Evict sessions persisted before the backend started returning id.
    // Without id, PUT and DELETE would silently call /usuarios/undefined.
    if (!parsed?.id) {
      localStorage.removeItem(STORAGE_KEYS.user)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

/** Throws if id is absent — prevents fetch calls to /usuarios/undefined. */
function validateId(id) {
  if (!id) {
    console.error('[AuthContext] user.id is missing — aborting API call.')
    throw new Error('Sessão inválida. Faça login novamente.')
  }
}

function persist(userData) {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData))
}

export function AuthProvider({ children }) {
  // Initialise from localStorage so F5 keeps the user logged in
  const [user, setUser] = useState(() => readStorage())

  /**
   * Calls POST /usuario to create a new account, then logs the user in.
   * Always registers as ALUNO — tipoUsuario is fixed by the backend contract.
   * Throws a localised error string on failure.
   */
  async function signup({ nome, email, senha }) {
    const res = await fetch(ENDPOINTS.signup, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ nome, email, senha, tipoUsuario: 'ALUNO', ativo: true }),
    })

    if (!res.ok) {
      if (res.status === 409) throw new Error('Este e-mail já está cadastrado.')
      throw new Error('Não foi possível criar sua conta. Tente novamente.')
    }

    // Registration succeeded — log the user in immediately using the same
    // credentials so the session is established in a single user action.
    return login({ email, senha })
  }

  /**
   * Calls POST /auth/login, normalises the response, persists and sets the user.
   * Throws a localised error string on failure so the caller can show it in the UI.
   * Returns the stored user object so callers can read the role immediately.
   */
  async function login({ email, senha }) {
    const res = await fetch(ENDPOINTS.login, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, senha }),
    })

    if (!res.ok) {
      // 401 → wrong credentials; anything else → generic server error
      if (res.status === 401) throw new Error('E-mail ou senha incorretos.')
      throw new Error('Erro no servidor. Tente novamente.')
    }

    const data = await res.json()  // { id, nome, role: 'ADMIN' | 'PROFESSOR' | 'ALUNO' }

    const userData = {
      id:          data.id,
      name:        data.nome,
      avatar:      data.nome.charAt(0).toUpperCase(),
      role:        ROLE_MAP[data.role] ?? 'student',
      tipoUsuario: data.role,   // kept verbatim for PUT requests
      email,
    }

    persist(userData)
    setUser(userData)
    return userData
  }

  /**
   * Calls PUT /usuarios/{id} to update the authenticated user's profile.
   * Only sends senha when the caller provides it (empty string = no change).
   * Throws a localised error string on failure.
   */
  async function updateUser({ nome, email, senha }) {
    validateId(user?.id)

    const body = { nome, email, tipoUsuario: user.tipoUsuario, ativo: true }
    if (senha) body.senha = senha

    const res = await fetch(ENDPOINTS.userById(user.id), {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })

    if (!res.ok) {
      if (res.status === 409) throw new Error('Este e-mail já está em uso.')
      throw new Error('Não foi possível salvar as alterações. Tente novamente.')
    }

    const updated = {
      ...user,
      name:   nome,
      avatar: nome.charAt(0).toUpperCase(),
      email,
    }
    persist(updated)
    setUser(updated)
  }

  /**
   * Calls DELETE /usuarios/{id}, then clears all local auth state.
   * Throws a localised error string on failure.
   */
  async function deleteUser() {
    validateId(user?.id)

    const res = await fetch(ENDPOINTS.userById(user.id), { method: 'DELETE' })

    if (!res.ok) throw new Error('Não foi possível excluir a conta. Tente novamente.')

    localStorage.removeItem(STORAGE_KEYS.user)
    sessionStorage.removeItem(STORAGE_KEYS.dashboardEntered)
    setUser(null)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEYS.user)
    sessionStorage.removeItem(STORAGE_KEYS.dashboardEntered)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, updateUser, deleteUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
