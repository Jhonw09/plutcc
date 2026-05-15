import { ENDPOINTS, api } from '../apiClient'

export async function matricular(alunoId, trilhaId) {
  return api(ENDPOINTS.matriculas, {
    method: 'POST',
    body: JSON.stringify({ alunoId, trilhaId }),
  }).catch(err => {
    if (err.status === 409) throw new Error('Você já está matriculado nesta trilha.')
    if (err.status === 404) throw new Error('Trilha não encontrada.')
    throw new Error('Erro ao realizar matrícula.')
  })
}

export async function desmatricular(alunoId, trilhaId) {
  return api(ENDPOINTS.matriculaDelete(trilhaId, alunoId), {
    method: 'DELETE',
  }).catch(err => {
    if (err.status === 404) throw new Error('Matrícula não encontrada.')
    throw new Error('Erro ao cancelar matrícula.')
  })
}

export async function getMatriculasDoAluno(alunoId) {
  return api(ENDPOINTS.matriculasByAluno(alunoId)).catch(() => {
    throw new Error('Erro ao carregar matrículas.')
  })
}

export async function getAlunosDaTrilha(trilhaId) {
  return api(ENDPOINTS.matriculasByTrilha(trilhaId)).catch(() => {
    throw new Error('Erro ao carregar alunos da trilha.')
  })
}

export async function getResumoProfessor(professorId) {
  return api(ENDPOINTS.matriculasResumoProfessor(professorId)).catch(() => null)
}

export async function verificarMatricula(alunoId, trilhaId) {
  const result = await api(ENDPOINTS.matriculaExiste(alunoId, trilhaId)).catch(() => false)
  // backend pode retornar boolean direto ou { matriculado: true }
  if (typeof result === 'boolean') return result
  return result?.matriculado ?? result?.existe ?? false
}
