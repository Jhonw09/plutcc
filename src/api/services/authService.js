import { ENDPOINTS, api } from '../apiClient'

async function login({ email, senha }) {
  const data = await api(ENDPOINTS.login, {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  }).catch(err => {
    if (err.status === 400) throw new Error(err.message)
    if (err.status === 401) throw new Error('E-mail ou senha incorretos.')
    throw new Error('Erro no servidor. Tente novamente.')
  })

  if (!data?.id || !data?.nome || !data?.role) {
    throw new Error('Resposta do servidor invalida. Contate o suporte.')
  }

  return data
}

async function signup({ nome, email, senha, tipoUsuario = 'ALUNO' }) {
  await api(ENDPOINTS.signup, {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha, tipoUsuario, ativo: true }),
  }).catch(err => {
    if (err.status === 400) throw new Error(err.message)
    if (err.status === 409) throw new Error('Este e-mail ja esta cadastrado.')
    throw new Error('Nao foi possivel criar sua conta. Tente novamente.')
  })
  // Nao faz login: usuario precisa verificar e-mail primeiro
  return { email }
}

async function updateUser(userId, { nome, email, tipoUsuario, senha }) {
  if (!userId) throw new Error('Sessao invalida. Faca login novamente.')
  const body = senha
    ? { nome, email, tipoUsuario, ativo: true, senha }
    : { nome, email, tipoUsuario, ativo: true }

  return api(ENDPOINTS.userById(userId), {
    method: 'PUT',
    body: JSON.stringify(body),
  }).catch(err => {
    if (err.status === 400) throw new Error(err.message)
    if (err.status === 409) throw new Error('Este e-mail ja esta em uso.')
    throw new Error('Nao foi possivel salvar as alteracoes. Tente novamente.')
  })
}

async function changePassword(userId, { nome, email, tipoUsuario, senha }) {
  if (!userId) throw new Error('Sessao invalida. Faca login novamente.')
  return api(ENDPOINTS.userById(userId), {
    method: 'PUT',
    body: JSON.stringify({ nome, email, tipoUsuario, ativo: true, senha }),
  }).catch(err => {
    if (err.status === 400) throw new Error(err.message)
    throw new Error('Nao foi possivel alterar a senha. Tente novamente.')
  })
}

async function deleteUser(userId) {
  if (!userId) throw new Error('Sessao invalida. Faca login novamente.')
  console.log('[authService.deleteUser] DELETE', ENDPOINTS.userById(userId))
  try {
    await api(ENDPOINTS.userById(userId), { method: 'DELETE' })
    console.log('[authService.deleteUser] sucesso')
  } catch (err) {
    console.error('[authService.deleteUser] falhou:', err.status, err.message)
    throw new Error('Nao foi possivel excluir a conta. Tente novamente.')
  }
}

async function verifyEmail(email, code) {
  await api(ENDPOINTS.verifyEmail, {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  }).catch(err => {
    if (err.status === 400) throw new Error(err.message)
    throw new Error('Não foi possível verificar o e-mail. Tente novamente.')
  })
}

async function resendVerification(email) {
  await api(ENDPOINTS.resendVerification, {
    method: 'POST',
    body: JSON.stringify({ email }),
  }).catch(err => {
    if (err.status === 400) throw new Error(err.message)
    throw new Error('Não foi possível reenviar o código. Tente novamente.')
  })
}

async function forgotPassword(email) {
  await api(ENDPOINTS.forgotPassword, {
    method: 'POST',
    body: JSON.stringify({ email }),
  }).catch(() => {
    // Sempre silencioso: servidor nunca revela se e-mail existe
  })
}

async function resetPassword(token, novaSenha) {
  await api(ENDPOINTS.resetPassword, {
    method: 'POST',
    body: JSON.stringify({ token, novaSenha }),
  }).catch(err => {
    if (err.status === 400) throw new Error(err.message)
    throw new Error('Não foi possível redefinir a senha. Tente novamente.')
  })
}

export const authService = { login, signup, updateUser, changePassword, deleteUser, forgotPassword, resetPassword, verifyEmail, resendVerification }
