import { ENDPOINTS, api } from '../apiClient'

export async function concluirAula(alunoId, aulaId) {
  return api(ENDPOINTS.progressoConcluir, {
    method: 'POST',
    body: JSON.stringify({ alunoId, aulaId }),
  }).catch(() => { throw new Error('Erro ao registrar conclusão da aula.') })
}

// Retorna List<Long> de aulaIds — usado pelo hook useTrilhasAluno
export async function getAulasConcluidasAluno(alunoId) {
  if (!alunoId) return []
  return api(ENDPOINTS.progressoAlunoIds(alunoId)).catch(() => [])
}

// Retorna [{ aulaId, concluidaEm }] — usado pela página de Desempenho
export async function getProgressoCompleto(alunoId) {
  if (!alunoId) return []
  return api(ENDPOINTS.progressoAluno(alunoId)).catch(() => [])
}

export async function getProgressoTrilha(trilhaId, alunoId) {
  if (!trilhaId || !alunoId) return { aulasConcluidas: [], totalAulas: 0, percentual: 0 }
  return api(ENDPOINTS.progressoTrilhaAluno(trilhaId, alunoId))
    .catch(() => ({ aulasConcluidas: [], totalAulas: 0, percentual: 0 }))
}
