import { ENDPOINTS, api } from '../apiClient'

export async function createTrilha(trilhaData) {
  if (!trilhaData.professorId)  throw new Error('ID do professor é obrigatório')
  if (!trilhaData.nome?.trim()) throw new Error('Nome da trilha é obrigatório')
  if (!trilhaData.nivel)        throw new Error('Nível da trilha é obrigatório')

  return api(ENDPOINTS.trilhas, {
    method: 'POST',
    body: JSON.stringify({
      nome:          trilhaData.nome.trim(),
      descricao:     trilhaData.descricao?.trim() || '',
      tipo:          trilhaData.tipo || 'PUBLICA',
      nivel:         trilhaData.nivel,
      disciplina:    trilhaData.disciplina || '',
      professorId:   trilhaData.professorId,
      professorNome: trilhaData.professorNome || '',
    }),
  }).catch(err => {
    if (err.status === 404) throw new Error('Professor não encontrado.')
    if (err.status === 400) throw new Error('Dados da trilha inválidos.')
    throw new Error(`Erro ao criar trilha: ${err.status}`)
  })
}

export async function updateTrilha(id, trilhaData) {
  if (!id) throw new Error('ID da trilha é obrigatório')
  return api(ENDPOINTS.trilhaById(id), {
    method: 'PUT',
    body: JSON.stringify({
      nome:       trilhaData.nome?.trim(),
      descricao:  trilhaData.descricao?.trim() || '',
      tipo:       trilhaData.tipo,
      nivel:      trilhaData.nivel,
      disciplina: trilhaData.disciplina || '',
    }),
  }).catch(err => {
    if (err.status === 404) throw new Error('Trilha não encontrada.')
    if (err.status === 400) throw new Error('Dados da trilha inválidos.')
    throw new Error(`Erro ao atualizar trilha: ${err.status}`)
  })
}

export async function getTrilhas() {
  return api(ENDPOINTS.trilhas).catch(() => { throw new Error('Erro ao carregar trilhas.') })
}

export async function getTrilhaById(id) {
  if (!id) throw new Error('ID da trilha é obrigatório')
  return api(ENDPOINTS.trilhaById(id)).catch(err => {
    if (err.status === 403) throw new Error('acesso_negado')
    throw new Error('Erro ao carregar trilha.')
  })
}

export async function getMyTrilhas(professorId) {
  if (!professorId) throw new Error('ID do professor é obrigatório')
  return api(ENDPOINTS.trilhasByProf(professorId)).catch(() => {
    throw new Error('Erro ao carregar suas trilhas.')
  })
}

/** Trilhas visíveis para o aluno — filtradas no backend */
export async function getTrilhasPublicas() {
  return api(ENDPOINTS.trilhas).catch(() => { throw new Error('Erro ao carregar trilhas.') })
}

export async function deleteTrilha(id) {
  if (!id) throw new Error('ID da trilha é obrigatório')
  return api(ENDPOINTS.trilhaById(id), { method: 'DELETE' }).catch(() => {
    throw new Error('Erro ao excluir trilha.')
  })
}

/** Retorna o código de acesso de uma trilha privada (professor/admin). */
export async function getCodigoAcesso(trilhaId) {
  return api(ENDPOINTS.trilhaCodigo(trilhaId)).catch(err => {
    if (err.status === 403) throw new Error('Sem permissão para ver o código.')
    if (err.status === 400) throw new Error('Esta trilha não possui código de acesso.')
    throw new Error('Erro ao carregar código de acesso.')
  })
}

/** Regenera o código de acesso de uma trilha privada (professor/admin). */
export async function regenerarCodigoAcesso(trilhaId) {
  return api(ENDPOINTS.trilhaCodigoRegenerar(trilhaId), { method: 'POST' }).catch(err => {
    if (err.status === 403) throw new Error('Sem permissão para regenerar o código.')
    throw new Error('Erro ao regenerar código de acesso.')
  })
}

/** Aluno informa o código para obter acesso a uma trilha privada. */
export async function solicitarAcessoPrivado(trilhaId, codigo) {
  return api(ENDPOINTS.trilhaAcesso(trilhaId), {
    method: 'POST',
    body: JSON.stringify({ codigo }),
  }).catch(err => {
    if (err.status === 401) throw new Error('Código de acesso inválido.')
    if (err.status === 409) throw new Error('Você já possui acesso a esta trilha.')
    if (err.status === 400) throw new Error(err.message || 'Requisição inválida.')
    throw new Error('Erro ao solicitar acesso.')
  })
}
