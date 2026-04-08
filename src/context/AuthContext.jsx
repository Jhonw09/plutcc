import { createContext, useContext, useState } from 'react'
import { authService } from '../api/services/authService'
import { ROLE_MAP } from '../api/services/config'
import { STORAGE_KEYS } from '../constants/storageKeys'

const AuthContext = createContext(null)

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
  console.log('[AuthContext] Persisting user to localStorage:', { id: userData.id, name: userData.name, role: userData.role })
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData))
}

export function AuthProvider({ children }) {
  // Initialise from localStorage so F5 keeps the user logged in
  const [user, setUser] = useState(() => {
    const stored = readStorage()
    if (stored) {
      console.log('[AuthContext] Restored user from localStorage:', { id: stored.id, name: stored.name, role: stored.role })
    }
    return stored
  })

  /**
   * Calls authService.signup to create a new account, then logs the user in.
   * Always registers as ALUNO — tipoUsuario is fixed by the backend contract.
   * Throws a localised error string on failure.
   */
  async function signup({ nome, email, senha, tipoUsuario = 'ALUNO' }) {
    console.log('[AuthContext] Starting signup flow for:', email)
    try {
      const data = await authService.signup({ nome, email, senha, tipoUsuario })
      console.log('[AuthContext] Signup response:', { id: data.id, nome: data.nome, role: data.role })
      return loginWithData({ email, data })
    } catch (err) {
      console.error('[AuthContext] Signup failed:', err.message)
      throw err
    }
  }

  /**
   * Calls authService.login, normalises the response, persists and sets the user.
   * Throws a localised error string on failure so the caller can show it in the UI.
   * Returns the stored user object so callers can read the role immediately.
   */
  async function login({ email, senha }) {
    console.log('[AuthContext] Starting login flow for:', email)
    try {
      const data = await authService.login({ email, senha })
      console.log('[AuthContext] Login response:', { id: data.id, nome: data.nome, role: data.role })
      return loginWithData({ email, data })
    } catch (err) {
      console.error('[AuthContext] Login failed:', err.message)
      throw err
    }
  }

  /**
   * Helper: normalise auth response, persist, and update state.
   * @private
   */
  function loginWithData({ email, data }) {
    console.log('[AuthContext] Processing auth response:', { id: data?.id, nome: data?.nome, role: data?.role })
    
    const userData = {
      id:          data.id,
      name:        data.nome,
      avatar:      data.nome.charAt(0).toUpperCase(),
      role:        ROLE_MAP[data.role] ?? 'student',
      tipoUsuario: data.role,   // kept verbatim for PUT requests
      email,
    }

    console.log('[AuthContext] Normalized user data:', { id: userData.id, name: userData.name, role: userData.role })
    
    persist(userData)
    setUser(userData)
    return userData
  }

  /**
   * Calls authService.updateUser to update the authenticated user's profile.
   * Throws a localised error string on failure.
   */
  async function updateUser({ nome, email }) {
    console.log('[AuthContext] Updating user:', user?.id)
    validateId(user?.id)

    await authService.updateUser(user.id, { nome, email, tipoUsuario: user.tipoUsuario })

    const updated = { ...user, name: nome, avatar: nome.charAt(0).toUpperCase(), email }
    console.log('[AuthContext] User updated successfully')
    persist(updated)
    setUser(updated)
  }

  /**
   * Calls authService.changePassword to change the password.
   * Throws a localised error string on failure.
   */
  async function changePassword({ senha }) {
    console.log('[AuthContext] Changing password for:', user?.id)
    validateId(user?.id)

    await authService.changePassword(user.id, {
      nome:        user.name,
      email:       user.email,
      tipoUsuario: user.tipoUsuario,
      senha,
    })
    console.log('[AuthContext] Password changed successfully')
  }

  /**
   * Calls authService.deleteUser, then clears all local auth state.
   * Throws a localised error string on failure.
   */
  async function deleteUser() {
    console.log('[AuthContext] Deleting user:', user?.id)
    validateId(user?.id)

    await authService.deleteUser(user.id)

    console.log('[AuthContext] User deleted. Clearing local state.')
    localStorage.removeItem(STORAGE_KEYS.user)
    sessionStorage.removeItem(STORAGE_KEYS.dashboardEntered)
    setUser(null)
  }

  function logout() {
    console.log('[AuthContext] Logging out user:', user?.id)
    localStorage.removeItem(STORAGE_KEYS.user)
    sessionStorage.removeItem(STORAGE_KEYS.dashboardEntered)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, updateUser, changePassword, deleteUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
