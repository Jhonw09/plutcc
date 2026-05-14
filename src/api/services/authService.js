import { ENDPOINTS, api } from '../apiClient'

async function login({ email, senha }) {
  const data = await api(ENDPOINTS.login, {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  }).catch(err => {
    if (err.status === 401) throw new Error('E-mail ou senha incorretos.')
    throw new Error('Erro no servidor. Tente novamente.')
  })

  if (!data?.id || !data?.nome || !data?.role)
    throw new Error('Resposta do servidor inválida. Contate o suporte.')

  return data // { id, nome, role: 'ADMIN' | 'PROFESSOR' | 'ALUNO' }
}

async function signup({ nome, email, senha, tipoUsuario = 'ALUNO' }) {
  await api(ENDPOINTS.signup, {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha, tipoUsuario, ativo: true }),
  }).catch(err => {
    if (err.status === 409) throw new Error('Este e-mail já está cadastrado.')
    throw new Error('Não foi possível criar sua conta. Tente novamente.')
  })

  return login({ email, senha })
}

async function updateUser(userId, { nome, email, tipoUsuario, senha }) {
  if (!userId) throw new Error('Sessão inválida. Faça login novamente.')
  return api(ENDPOINTS.userById(userId), {
    method: 'PUT',
    body: JSON.stringify({ nome, email, tipoUsuario, ativo: true, senha }),
  }).catch(err => {
    if (err.status === 409) throw new Error('Este e-mail já está em uso.')
    throw new Error('Não foi possível salvar as alterações. Tente novamente.')
  })
}

async function changePassword(userId, { nome, email, tipoUsuario, senha }) {
  if (!userId) throw new Error('Sessão inválida. Faça login novamente.')
  return api(ENDPOINTS.userById(userId), {
    method: 'PUT',
    body: JSON.stringify({ nome, email, tipoUsuario, ativo: true, senha }),
  }).catch(() => {
    throw new Error('Não foi possível alterar a senha. Tente novamente.')
  })
}

async function deleteUser(userId) {
  if (!userId) throw new Error('Sessão inválida. Faça login novamente.')
  console.log('[authService.deleteUser] DELETE', ENDPOINTS.userById(userId))
  try {
    await api(ENDPOINTS.userById(userId), { method: 'DELETE' })
    console.log('[authService.deleteUser] sucesso')
  } catch (err) {
    console.error('[authService.deleteUser] falhou:', err.status, err.message)
    throw new Error('Não foi possível excluir a conta. Tente novamente.')
  }
}

export const authService = { login, signup, updateUser, changePassword, deleteUser }
