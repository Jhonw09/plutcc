import { ENDPOINTS, API_BASE, api } from '../apiClient'
import { getEstatisticasTrilha } from './duvidaService'

export async function getAdminResumo() {
  return api(`${API_BASE}/admin/resumo`).catch(() => { throw new Error('Erro ao carregar painel.') })
}

export async function getUsuarios() {
  return api(ENDPOINTS.usuarios).catch(() => { throw new Error('Erro ao carregar usuários.') })
}

export async function toggleAtivo(usuario) {
  const body = {
    nome:        usuario.nome,
    email:       usuario.email,
    tipoUsuario: usuario.tipoUsuario,
    ativo:       !usuario.ativo,
  }
  return api(ENDPOINTS.userById(usuario.id), {
    method: 'PUT',
    body: JSON.stringify(body),
  }).catch(() => { throw new Error('Não foi possível alterar o status do usuário.') })
}

export async function solicitarDesafioExclusao(usuarioId, senha) {
  if (!usuarioId) throw new Error('Usuário inválido.')
  return api(ENDPOINTS.deleteChallenge(usuarioId), {
    method: 'POST',
    body: JSON.stringify({ senha }),
  }).catch(err => {
    if ([400, 401, 403, 404].includes(err.status)) throw new Error(err.message)
    throw new Error('Não foi possível enviar o código de confirmação. Tente novamente.')
  })
}

export async function deleteUsuarioComAuth(usuarioId, senha, codigoMfa) {
  if (!usuarioId) throw new Error('Usuário inválido.')
  const body = { senha, codigoMfa }
  return api(ENDPOINTS.userById(usuarioId), {
    method: 'DELETE',
    body: JSON.stringify(body),
  }).catch(err => {
    if ([400, 401, 403, 404].includes(err.status)) throw new Error(err.message)
    throw new Error('Não foi possível excluir o usuário. Tente novamente.')
  })
}

export async function getTrilhasAdmin() {
  const trilhas = await api(ENDPOINTS.trilhas).catch(() => { throw new Error('Erro ao carregar trilhas.') })
  if (!Array.isArray(trilhas)) throw new Error('Erro ao carregar trilhas.')

  const comStats = await Promise.all(
    trilhas.map(t =>
      getEstatisticasTrilha(t.id)
        .then(stats => ({ ...t, totalAlunos: stats?.totalAlunos ?? 0 }))
        .catch(() => ({ ...t, totalAlunos: 0 }))
    )
  )
  return comStats
}

export async function getDuvidasAdmin(trilhaId) {
  return api(`${API_BASE}/duvidas/trilha/${trilhaId}`).catch(() => [])
}
