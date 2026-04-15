import { API_BASE } from './config'

const ENDPOINTS = {
  cursos:      `${API_BASE}/cursos`,
  cursoById:   (id) => `${API_BASE}/cursos/${id}`,
  minhasTrilhas: (professorId) => `${API_BASE}/cursos?professorId=${professorId}`,
}

export async function createTrilha(trilhaData) {
  if (!trilhaData.professorId) throw new Error('ID do professor é obrigatório')
  if (!trilhaData.nome?.trim())  throw new Error('Nome da trilha é obrigatório')
  if (!trilhaData.nivel)         throw new Error('Nível da trilha é obrigatório')

  const payload = {
    nome:        trilhaData.nome.trim(),
    descricao:   trilhaData.descricao?.trim() || '',
    duracao:     trilhaData.duracao || '',
    nivel:       trilhaData.nivel,
    ativo:       true,
    professor:   { id: trilhaData.professorId },
  }

  const response = await fetch(ENDPOINTS.cursos, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    if (response.status === 404) throw new Error('Professor não encontrado.')
    if (response.status === 400) throw new Error('Dados da trilha inválidos.')
    throw new Error(`Erro ao criar trilha: ${response.status}`)
  }

  return response.json()
}

export async function getTrilhas() {
  const response = await fetch(ENDPOINTS.cursos)
  if (!response.ok) throw new Error(`Erro ao carregar trilhas: ${response.status}`)
  return response.json()
}

export async function getTrilhaById(id) {
  if (!id) throw new Error('ID da trilha é obrigatório')
  const response = await fetch(ENDPOINTS.cursoById(id))
  if (!response.ok) throw new Error(`Erro ao carregar trilha: ${response.status}`)
  return response.json()
}

export async function getMyTrilhas(professorId) {
  if (!professorId) throw new Error('ID do professor é obrigatório')
  const response = await fetch(ENDPOINTS.minhasTrilhas(professorId))
  if (!response.ok) throw new Error(`Erro ao carregar suas trilhas: ${response.status}`)
  return response.json()
}

export async function deleteTrilha(id) {
  if (!id) throw new Error('ID da trilha é obrigatório')
  const response = await fetch(ENDPOINTS.cursoById(id), { method: 'DELETE' })
  if (!response.ok) throw new Error(`Erro ao excluir trilha: ${response.status}`)
}
