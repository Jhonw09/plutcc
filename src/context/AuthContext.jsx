import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../api/services/authService'
import { AUTH_EXPIRED_EVENT, clearAccessToken, getAccessToken, ROLE_MAP, storeAccessToken } from '../api/apiClient'
import { STORAGE_KEYS } from '../constants/storageKeys'

const AuthContext = createContext(null)

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.id || !getAccessToken()) {
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
  // true enquanto aguarda validação do código MFA
  const [mfaPending, setMfaPending] = useState(
    () => !!sessionStorage.getItem(STORAGE_KEYS.mfaPendingEmail)
  )

  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.user)
    clearAccessToken()
    sessionStorage.removeItem(STORAGE_KEYS.dashboardEntered)
    sessionStorage.removeItem(STORAGE_KEYS.mfaPendingEmail)
    sessionStorage.removeItem('sc_mfa_is_google')
    setMfaPending(false)
    setUser(null)
  }

  useEffect(() => {
    function handleExpiredSession() {
      clearSession()
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpiredSession)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpiredSession)
  }, [])

  async function signup({ nome, email, senha, tipoUsuario = 'ALUNO' }) {
    await authService.signup({ nome, email, senha, tipoUsuario })
    return { email }
  }

  async function login({ email, senha }) {
    const data = await authService.login({ email, senha })
    return loginWithData({ data, isGoogle: false })
  }

  async function loginWithGoogle(idToken) {
    const data = await authService.googleLogin(idToken)
    return loginWithData({ data, isGoogle: true })
  }

  function loginWithData({ data, isGoogle = false }) {
    // Resposta de MFA pendente — não há accessToken ainda
    if (data?.mfaPendente === true) {
      sessionStorage.setItem(STORAGE_KEYS.mfaPendingEmail, data.email ?? '')
      sessionStorage.setItem('sc_mfa_is_google', isGoogle ? '1' : '0')
      setMfaPending(true)
      // user permanece null — não autenticado
      return { mfaPendente: true, email: data.email }
    }

    if (!data?.accessToken || !data?.expiresIn) {
      throw new Error('Resposta de autenticacao invalida. Faca login novamente.')
    }

    const userData = {
      id:            data.id,
      name:          data.nome,
      avatar:        data.nome.charAt(0).toUpperCase(),
      role:          ROLE_MAP[data.role] ?? 'student',
      tipoUsuario:   data.role,
      email:         data.email ?? null,
      fotoUrl:       data.fotoUrl ?? null,
      isGoogleUser:  isGoogle,
      ativo:         data.ativo !== false,
      mfaHabilitado: data.mfaHabilitado === true,
    }

    if (userData.ativo === false) return userData // conta suspensa — não persiste

    storeAccessToken(data.accessToken, data.expiresIn)
    persist(userData)
    setUser(userData)
    return userData
  }

  /** Chamado após o usuário informar o código MFA. */
  async function verifyMfa(code) {
    const email = sessionStorage.getItem(STORAGE_KEYS.mfaPendingEmail)
    if (!email) throw new Error('Sessão MFA expirada. Faça login novamente.')

    const isGoogle = sessionStorage.getItem('sc_mfa_is_google') === '1'
    const data = await authService.verifyMfa(email, code)

    // Limpa estado intermediário antes de finalizar o login
    sessionStorage.removeItem(STORAGE_KEYS.mfaPendingEmail)
    sessionStorage.removeItem('sc_mfa_is_google')
    setMfaPending(false)

    return loginWithData({ data, isGoogle })
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

  function updateUserEmail(email) {
    validateId(user?.id)
    const updated = { ...user, email }
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

  /** Habilita ou desabilita MFA após confirmação de senha. Atualiza user em memória. */
  async function toggleMfa(enable, senha) {
    validateId(user?.id)
    if (enable) {
      await authService.enableMfa(senha)
    } else {
      await authService.disableMfa(senha)
    }
    const updated = { ...user, mfaHabilitado: enable }
    persist(updated)
    setUser(updated)
  }

  async function requestDeleteChallenge(senha) {
    validateId(user?.id)
    await authService.requestDeleteChallenge(user.id, senha)
  }

  async function deleteUserWithAuth(senha, codigoMfa) {
    validateId(user?.id)
    await authService.deleteUserWithAuth(user.id, senha, codigoMfa ?? null)
    clearSession()
  }

  function logout() {
    clearSession()
  }

  return (
    <AuthContext.Provider value={{
      user, mfaPending,
      login, loginWithGoogle, verifyMfa,
      signup, updateUser, updateUserEmail, changePassword, deleteUserWithAuth, requestDeleteChallenge, logout, toggleMfa,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
