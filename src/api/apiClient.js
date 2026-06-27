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

  // Progresso
  progressoConcluir:           `${API_BASE}/progresso/concluir`,
  progressoAluno:              (alunoId)           => `${API_BASE}/progresso/aluno/${alunoId}`,
  progressoAlunoIds:           (alunoId)           => `${API_BASE}/progresso/aluno/${alunoId}/ids`,
  progressoTrilhaAluno:        (trilhaId, alunoId) => `${API_BASE}/progresso/trilha/${trilhaId}/aluno/${alunoId}`,

  // Perfil de aprendizado
  perfilAprendizado:           (alunoId) => `${API_BASE}/perfil-aprendizado/${alunoId}`,
  perfilAprendizadoCreate:     `${API_BASE}/perfil-aprendizado`,

  // Verificação de e-mail
  verifyEmail:          `${API_BASE}/auth/verify-email`,
  resendVerification:   `${API_BASE}/auth/resend-verification`,

  // Google OAuth2
  googleAuth:           `${API_BASE}/auth/google`,

  // Troca de e-mail (2 etapas)
  emailChangeRequest:   `${API_BASE}/auth/email-change/request`,
  emailChangeConfirm:   (token) => `${API_BASE}/auth/email-change/confirm?token=${token}`,
  emailChangeVerify:    `${API_BASE}/auth/email-change/verify`,

  // Recuperação de senha
  forgotPassword: `${API_BASE}/auth/forgot-password`,
  resetPassword:  `${API_BASE}/auth/reset-password`,

  // Dúvidas
  duvidas:                     `${API_BASE}/duvidas`,
  duvidaResponder:             (id) => `${API_BASE}/duvidas/${id}/responder`,
  duvidaResolver:              (id) => `${API_BASE}/duvidas/${id}/resolver`,
  duvidasByTrilha:             (trilhaId) => `${API_BASE}/duvidas/trilha/${trilhaId}`,
  duvidasByAula:               (aulaId)   => `${API_BASE}/duvidas/aula/${aulaId}`,
  duvidasByAlunoEAula:         (alunoId, aulaId) => `${API_BASE}/duvidas/aluno/${alunoId}/aula/${aulaId}`,

  // Estatísticas da trilha
  estatisticasTrilha:          (trilhaId) => `${API_BASE}/matriculas/trilha/${trilhaId}/estatisticas`,
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
    let message = text || `HTTP ${res.status}`
    try {
      const parsed = JSON.parse(text)
      message = parsed.error || parsed.message || message
    } catch {
      // Keep the raw response text when it is not JSON.
    }
    const err = new Error(message)
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
