import { ENDPOINTS, api } from '../apiClient'

export async function createTrilha(trilhaData) {
  if (!trilhaData.professorId)  throw new Error('ID do professor é obrigatório')
  if (!trilhaData.nome?.trim()) throw new Error('Nome da trilha é obrigatório')
  if (!trilhaData.nivel)        throw new Error('Nível da trilha é obrigatório')

  // Entidade Trilha usa professorId (Long) direto — não usa professor:{ id }
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
  return api(ENDPOINTS.trilhaById(id)).catch(() => { throw new Error('Erro ao carregar trilha.') })
}

export async function getMyTrilhas(professorId) {
  if (!professorId) throw new Error('ID do professor é obrigatório')
  return api(ENDPOINTS.trilhasByProf(professorId)).catch(() => {
    throw new Error('Erro ao carregar suas trilhas.')
  })
}

export async function getTrilhasPublicas() {
  const todas = await api(ENDPOINTS.trilhas).catch(() => { throw new Error('Erro ao carregar trilhas.') })
  return todas.filter(t => t.tipo !== 'PRIVADA')
}

export async function deleteTrilha(id) {
  if (!id) throw new Error('ID da trilha é obrigatório')
  return api(ENDPOINTS.trilhaById(id), { method: 'DELETE' }).catch(() => {
    throw new Error('Erro ao excluir trilha.')
  })
}
