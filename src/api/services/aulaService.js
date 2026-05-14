import { ENDPOINTS, api } from '../apiClient'

// Converte array flat de blocos → envelope { versao, blocos[] } que o backend espera
function toEnvelope(blocos) {
  return {
    versao: 1,
    blocos: blocos.map((b, i) => ({ ...b, ordem: i + 1 })),
  }
}

// Converte envelope do backend → array flat ordenado (compatível com AulaEditor)
function fromEnvelope(envelope) {
  if (!envelope?.blocos) return []
  return [...envelope.blocos].sort((a, b) => a.ordem - b.ordem)
}

// Faz parse seguro do campo conteudo (pode ser string JSON ou objeto)
function parseConteudo(conteudo) {
  if (!conteudo) return {}
  if (typeof conteudo === 'object') return conteudo
  try { return JSON.parse(conteudo) } catch { return {} }
}

export async function createAula(aulaData) {
  if (!aulaData.trilhaId)       throw new Error('ID da trilha é obrigatório')
  if (!aulaData.titulo?.trim()) throw new Error('Título da aula é obrigatório')

  // Backend armazena blocos no campo conteudo como JSON string
  const envelope = toEnvelope(aulaData.blocos ?? [])

  const created = await api(ENDPOINTS.aulas, {
    method: 'POST',
    body: JSON.stringify({
      titulo:   aulaData.titulo.trim(),
      trilhaId: aulaData.trilhaId,
      conteudo: JSON.stringify(envelope),  // blocos serializados como string
    }),
  }).catch(err => {
    if (err.status === 400) throw new Error('Dados da aula inválidos.')
    if (err.status === 404) throw new Error('Trilha não encontrada.')
    throw new Error(`Erro ao criar aula: ${err.status}`)
  })

  return { ...created, blocos: fromEnvelope(parseConteudo(created.conteudo)) }
}

export async function getAulasByTrilha(trilhaId) {
  if (!trilhaId) throw new Error('ID da trilha é obrigatório')
  const aulas = await api(ENDPOINTS.aulasByTrilha(trilhaId)).catch(() => {
    throw new Error('Erro ao carregar aulas.')
  })
  return aulas.map(a => ({ ...a, blocos: fromEnvelope(parseConteudo(a.conteudo)) }))
}

export async function getAulaById(id) {
  if (!id) throw new Error('ID da aula é obrigatório')
  const aula = await api(ENDPOINTS.aulaById(id)).catch(() => {
    throw new Error('Erro ao carregar aula.')
  })
  return { ...aula, blocos: fromEnvelope(parseConteudo(aula.conteudo)) }
}

export async function updateAula(id, aulaData) {
  if (!id) throw new Error('ID da aula é obrigatório')
  const envelope = toEnvelope(aulaData.blocos ?? [])
  const updated = await api(ENDPOINTS.aulaById(id), {
    method: 'PUT',
    body: JSON.stringify({
      titulo:   aulaData.titulo?.trim(),
      conteudo: JSON.stringify(envelope),
    }),
  }).catch(() => {
    throw new Error('Erro ao atualizar aula.')
  })
  return { ...updated, blocos: fromEnvelope(parseConteudo(updated.conteudo)) }
}

export async function deleteAula(id) {
  if (!id) throw new Error('ID da aula é obrigatório')
  return api(ENDPOINTS.aulaById(id), { method: 'DELETE' }).catch(() => {
    throw new Error('Erro ao deletar aula.')
  })
}
