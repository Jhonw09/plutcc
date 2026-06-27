import { ENDPOINTS, API_BASE, api } from '../apiClient'
import { getEstatisticasTrilha } from './duvidaService'

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

export async function getTrilhasAdmin() {
  const trilhas = await api(ENDPOINTS.trilhas).catch(() => { throw new Error('Erro ao carregar trilhas.') })

  const comStats = await Promise.all(
    trilhas.map(async t => {
      const stats = await getEstatisticasTrilha(t.id)
      return { ...t, totalAlunos: stats?.totalAlunos ?? 0 }
    })
  )
  return comStats
}

export async function getDuvidasAdmin(trilhaId) {
  return api(`${API_BASE}/duvidas/trilha/${trilhaId}`).catch(() => [])
}
