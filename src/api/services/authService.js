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

  return login({ email, senha })
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

export const authService = { login, signup, updateUser, changePassword, deleteUser }
