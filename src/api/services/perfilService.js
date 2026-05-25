import { ENDPOINTS, api } from '../apiClient'

export async function getPerfil(alunoId) {
  if (!alunoId) return null
  return api(ENDPOINTS.perfilAprendizado(alunoId)).catch(err => {
    if (err.status === 404) return null
    return null
  })
}

export async function createPerfil(data) {
  return api(ENDPOINTS.perfilAprendizadoCreate, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updatePerfil(alunoId, data) {
  return api(ENDPOINTS.perfilAprendizado(alunoId), {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
