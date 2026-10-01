import { ENDPOINTS, api } from '../apiClient'

async function criar({ tipoComprovante, comprovanteUrl }) {
  return api(ENDPOINTS.solicitacoesProfessor, {
    method: 'POST',
    body: JSON.stringify({ tipoComprovante, comprovanteUrl }),
  }).catch(err => {
    if (err.status === 409) throw new Error(err.message)
    if (err.status === 400) throw new Error(err.message)
    throw new Error('Não foi possível enviar a solicitação. Tente novamente.')
  })
}

async function minhas() {
  return api(ENDPOINTS.solicitacoesMinhas).catch(err => {
    if (err.status === 401) return []
    throw new Error('Não foi possível consultar suas solicitações.')
  })
}

function mapError(err) {
  if (err.status === 403) throw new Error('Você não tem permissão para realizar esta ação.')
  if (err.status === 404) throw new Error('Solicitação não encontrada.')
  if (err.status === 409) throw new Error('Esta solicitação já foi analisada.')
  if (err.status === 400) throw new Error(err.message || 'Requisição inválida.')
  throw new Error('Erro de rede. Verifique sua conexão e tente novamente.')
}

async function listarPendentes() {
  return api(`${ENDPOINTS.solicitacoesProfessor}?status=PENDENTE`).catch(mapError)
}

async function buscarPorId(id) {
  return api(ENDPOINTS.solicitacaoById(id)).catch(mapError)
}

async function aprovar(id) {
  return api(ENDPOINTS.solicitacaoAprovar(id), { method: 'PUT' }).catch(mapError)
}

async function reprovar(id, motivoReprovacao) {
  return api(ENDPOINTS.solicitacaoReprovar(id), {
    method: 'PUT',
    body: JSON.stringify({ motivoReprovacao }),
  }).catch(mapError)
}

export const solicitacaoService = { criar, minhas, listarPendentes, buscarPorId, aprovar, reprovar }
