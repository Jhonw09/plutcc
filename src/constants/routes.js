export const ROLE_ROUTES = {
  student: '/dashboard',
  teacher: '/teacher-dashboard',
  admin:   '/admin',
}

export const DEFAULT_ROUTE = '/dashboard'

// ── Student routes ──────────────────────────────────────────
export const STUDENT_ROUTES = {
  home:        '/dashboard',
  trilhas:     '/dashboard/trilhas',
  desempenho:  '/dashboard/desempenho',
  subjects:    '/dashboard/disciplinas',
  exercises:   '/dashboard/exercicios',
  exams:       '/dashboard/simulados',
  goals:       '/dashboard/metas',
  settings:    '/dashboard/configuracoes',
  help:        '/dashboard/ajuda',
  trilhaDetalhe: (id) => `/dashboard/trilha-detalhe/${id}`,
}

// ── Teacher routes ───────────────────────────────────────────
export const TEACHER_ROUTES = {
  home:     '/teacher-dashboard',
  trilhas:  '/teacher-dashboard/trilhas',
  reports:  '/teacher-dashboard/relatorios',
  settings: '/teacher-dashboard/configuracoes',
}

// ── Admin routes ─────────────────────────────────────────────
export const ADMIN_ROUTES = {
  home:     '/admin',
  users:    '/admin/usuarios',
  schools:  '/admin/escolas',
  finance:  '/admin/financeiro',
  reports:  '/admin/relatorios',
  tickets:  '/admin/tickets',
  settings: '/admin/configuracoes',
  help:     '/admin/ajuda',
}
