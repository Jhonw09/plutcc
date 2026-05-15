const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
export const API_BASE = `${BASE}/api/v1`

export const ENDPOINTS = {
  // Auth
  login:    `${API_BASE}/auth/login`,
  signup:   `${API_BASE}/usuarios`,
  userById: (id) => `${API_BASE}/usuarios/${id}`,
  usuarios: `${API_BASE}/usuarios`,

  // Trilhas
  trilhas:        `${API_BASE}/trilhas`,
  trilhaById:     (id) => `${API_BASE}/trilhas/${id}`,
  trilhasByProf:  (professorId) => `${API_BASE}/trilhas?professorId=${professorId}`,

  // Aulas
  aulas:          `${API_BASE}/aulas`,
  aulasByTrilha:  (trilhaId) => `${API_BASE}/aulas/trilha/${trilhaId}`,
  aulaById:       (id) => `${API_BASE}/aulas/${id}`,

  // Matrículas
  matriculas:                  `${API_BASE}/matriculas`,
  matriculasByAluno:           (alunoId)   => `${API_BASE}/matriculas/aluno/${alunoId}`,
  matriculasByTrilha:          (trilhaId)  => `${API_BASE}/matriculas/trilha/${trilhaId}`,
  matriculasResumoProfessor:   (profId)    => `${API_BASE}/matriculas/professor/${profId}/resumo`,
  matriculaDelete:             (trilhaId, alunoId) => `${API_BASE}/matriculas/${trilhaId}/aluno/${alunoId}`,
  matriculaExiste:             (alunoId, trilhaId) => `${API_BASE}/matriculas/existe?alunoId=${alunoId}&trilhaId=${trilhaId}`,
}

export const ROLE_MAP = {
  ADMIN:     'admin',
  PROFESSOR: 'teacher',
  ALUNO:     'student',
}

export async function api(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const err = new Error(text || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }

  if (res.status === 204) return null
  const text = await res.text()
  if (!text || !text.trim()) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
