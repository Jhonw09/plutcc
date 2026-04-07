import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'sc_user'
const API_BASE    = 'http://localhost:8080'

// Backend roles → frontend roles
const ROLE_MAP = {
  ADMIN:     'admin',
  PROFESSOR: 'teacher',
  ALUNO:     'student',
}

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persist(userData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
}

export function AuthProvider({ children }) {
  // Initialise from localStorage so F5 keeps the user logged in
  const [user, setUser] = useState(() => readStorage())

  /**
   * Calls POST /auth/login, normalises the response, persists and sets the user.
   * Throws a localised error string on failure so the caller can show it in the UI.
   * Returns the stored user object so callers can read the role immediately.
   */
  async function login({ email, senha }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, senha }),
    })

    if (!res.ok) {
      // 401 → wrong credentials; anything else → generic server error
      if (res.status === 401) throw new Error('E-mail ou senha incorretos.')
      throw new Error('Erro no servidor. Tente novamente.')
    }

    const data = await res.json()  // { nome: string, role: 'ADMIN' | 'PROFESSOR' | 'ALUNO' }

    const userData = {
      name:   data.nome,
      avatar: data.nome.charAt(0).toUpperCase(),
      role:   ROLE_MAP[data.role] ?? 'student',
      email,
    }

    persist(userData)
    setUser(userData)
    return userData
  }

  // Updates name/email in both context state and localStorage
  function updateUser(patch) {
    const updated = { ...user, ...patch }
    persist(updated)
    setUser(updated)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem('sc_dashboard_entered')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
