export const ROLE_ROUTES = {
  student: '/dashboard',
  teacher: '/teacher-dashboard',
  admin:   '/admin',
}

export const DEFAULT_ROUTE = '/dashboard'

// ── Student routes ──────────────────────────────────────────
export const STUDENT_ROUTES = {
  home:      '/dashboard',
  subjects:  '/dashboard/disciplinas',
  exercises: '/dashboard/exercicios',
  exams:     '/dashboard/simulados',
  progress:  '/dashboard/desempenho',
  goals:     '/dashboard/metas',
  settings:  '/dashboard/configuracoes',
  help:      '/dashboard/ajuda',
}

// ── Teacher routes ───────────────────────────────────────────
export const TEACHER_ROUTES = {
  home:       '/teacher-dashboard',
  trilhas:    '/teacher-dashboard/trilhas',
  students:   '/teacher-dashboard/alunos',
  activities: '/teacher-dashboard/atividades',
  reports:    '/teacher-dashboard/relatorios',
  calendar:   '/teacher-dashboard/calendario',
  settings:   '/teacher-dashboard/configuracoes',
  help:       '/teacher-dashboard/ajuda',
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
