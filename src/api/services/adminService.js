import { ENDPOINTS, API_BASE, api } from '../apiClient'
import { getEstatisticasTrilha } from './duvidaService'

export async function getUsuarios() {
  return api(ENDPOINTS.usuarios).catch(() => { throw new Error('Erro ao carregar usuários.') })
}

export async function deleteUsuario(id) {
  return api(ENDPOINTS.userById(id), { method: 'DELETE' }).catch(() => {
    throw new Error('Não foi possível excluir o usuário.')
  })
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
