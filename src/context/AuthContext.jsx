import { createContext, useContext, useState } from 'react'
import { authService } from '../api/services/authService'
import { ROLE_MAP } from '../api/apiClient'
import { STORAGE_KEYS } from '../constants/storageKeys'

const AuthContext = createContext(null)

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.id) {
      localStorage.removeItem(STORAGE_KEYS.user)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

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
  const [user, setUser] = useState(() => readStorage())

  async function signup({ nome, email, senha, tipoUsuario = 'ALUNO' }) {
    try {
      await authService.signup({ nome, email, senha, tipoUsuario })
      return { email }
    } catch (err) {
      throw err
    }
  }

  async function login({ email, senha }) {
    try {
      const data = await authService.login({ email, senha })
      return loginWithData({ data, isGoogle: false })
    } catch (err) {
      throw err
    }
  }

  async function loginWithGoogle(idToken) {
    const data = await authService.googleLogin(idToken)
    return loginWithData({ data, isGoogle: true })
  }

  function loginWithData({ data, isGoogle = false }) {
    const userData = {
      id:           data.id,
      name:         data.nome,
      avatar:       data.nome.charAt(0).toUpperCase(),
      role:         ROLE_MAP[data.role] ?? 'student',
      tipoUsuario:  data.role,
      email:        data.email ?? null,
      fotoUrl:      data.fotoUrl ?? null,
      isGoogleUser: isGoogle,
      ativo:        data.ativo !== false,
    }
    if (userData.ativo === false) return userData // não persiste nem seta sessão
    persist(userData)
    setUser(userData)
    return userData
  }

async function updateUser({ nome, email, senha, fotoUrl }) {
    validateId(user?.id)

    if (!user.isGoogleUser) {
      try {
        await authService.login({ email: user.email, senha })
      } catch {
        throw new Error('Senha incorreta.')
      }
    }

    await authService.updateUser(user.id, {
      nome,
      email,
      tipoUsuario: user.tipoUsuario,
      fotoUrl,
    })

    const updated = { ...user, name: nome, avatar: nome.charAt(0).toUpperCase(), email, fotoUrl: fotoUrl ?? user.fotoUrl }
    persist(updated)
    setUser(updated)
  }

  async function changePassword({ senhaAtual, senha }) {
    validateId(user?.id)

    try {
      await authService.login({ email: user.email, senha: senhaAtual })
    } catch {
      throw new Error('Senha atual incorreta.')
    }

    await authService.changePassword(user.id, {
      nome:        user.name,
      email:       user.email,
      tipoUsuario: user.tipoUsuario,
      senha,
    })
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.user)
    sessionStorage.removeItem(STORAGE_KEYS.dashboardEntered)
    setUser(null)
  }

  async function deleteUser() {
    validateId(user?.id)
    await authService.deleteUser(user.id)
    clearSession()
  }

  function logout() {
    clearSession()
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, signup, updateUser, changePassword, deleteUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
