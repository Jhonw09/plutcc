import { ENDPOINTS, api } from '../apiClient'

export async function getDuvidasByTrilha(trilhaId) {
  return api(ENDPOINTS.duvidasByTrilha(trilhaId)).catch(() => [])
}

export async function getDuvidasByAlunoEAula(alunoId, aulaId) {
  return api(ENDPOINTS.duvidasByAlunoEAula(alunoId, aulaId)).catch(() => [])
}

export async function criarDuvida(alunoId, aulaId, trilhaId, mensagem) {
  return api(ENDPOINTS.duvidas, {
    method: 'POST',
    body: JSON.stringify({ alunoId, aulaId, trilhaId, mensagem }),
  })
}

export async function responderDuvida(id, resposta) {
  return api(ENDPOINTS.duvidaResponder(id), {
    method: 'PUT',
    body: JSON.stringify({ resposta }),
  })
}

export async function resolverDuvida(id) {
  return api(ENDPOINTS.duvidaResolver(id), { method: 'PUT' })
}

export async function getEstatisticasTrilha(trilhaId) {
  return api(ENDPOINTS.estatisticasTrilha(trilhaId)).catch(() => null)
}
