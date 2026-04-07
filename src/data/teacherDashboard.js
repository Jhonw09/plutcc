// ── Teacher Dashboard mock data ──────────────────────────────────────────────
// Replace each export with an API call when the backend is ready.
// e.g. export const fetchStats = () => api.get('/teacher/stats')

export const teacherStats = [
  { id: 'students',   icon: '👥', label: 'Total de alunos',      value: '128',  delta: '+4 esta semana',  deltaPositive: true  },
  { id: 'classes',    icon: '🏫', label: 'Turmas ativas',        value: '6',    delta: '2 turmas noturnas', deltaPositive: null  },
  { id: 'progress',   icon: '📈', label: 'Progresso médio',      value: '74%',  delta: '+3% vs mês passado', deltaPositive: true },
  { id: 'activities', icon: '✅', label: 'Atividades concluídas', value: '312',  delta: '48 esta semana',  deltaPositive: true  },
]

export const quickActions = [
  { id: 'create',  icon: '➕', label: 'Criar atividade',   desc: 'Nova tarefa ou prova para uma turma'  },
  { id: 'students',icon: '👤', label: 'Ver alunos',        desc: 'Lista completa com desempenho'        },
  { id: 'classes', icon: '📋', label: 'Gerenciar turmas',  desc: 'Editar turmas e adicionar alunos'     },
  { id: 'reports', icon: '📊', label: 'Relatórios',        desc: 'Exportar dados de desempenho'         },
]

export const students = [
  { id: 1, name: 'Ana Souza',      avatar: 'A', class: '3º A', pct: 91, status: 'active'  },
  { id: 2, name: 'Bruno Lima',     avatar: 'B', class: '3º A', pct: 58, status: 'behind'  },
  { id: 3, name: 'Carla Mendes',   avatar: 'C', class: '2º B', pct: 76, status: 'active'  },
  { id: 4, name: 'Diego Ferreira', avatar: 'D', class: '2º B', pct: 34, status: 'at-risk' },
  { id: 5, name: 'Elena Costa',    avatar: 'E', class: '1º C', pct: 82, status: 'active'  },
  { id: 6, name: 'Felipe Rocha',   avatar: 'F', class: '1º C', pct: 21, status: 'at-risk' },
]

export const recentActivity = [
  { id: 1, icon: '✅', student: 'Ana Souza',      action: 'concluiu "Funções Quadráticas — Parte 2"', time: 'há 15min', color: 'var(--success)'  },
  { id: 2, icon: '📝', student: 'Bruno Lima',     action: 'enviou a atividade de Química',            time: 'há 1h',    color: '#93c5fd'         },
  { id: 3, icon: '⚠️', student: 'Diego Ferreira', action: 'não entregou a tarefa de História',        time: 'há 3h',    color: 'var(--danger)'   },
  { id: 4, icon: '🏆', student: 'Carla Mendes',   action: 'atingiu 100% em Interpretação Textual',    time: 'ontem',    color: '#fbbf24'         },
  { id: 5, icon: '📋', student: 'Elena Costa',    action: 'iniciou o simulado ENEM — Exatas',         time: 'ontem',    color: '#a78bfa'         },
]

// Students flagged for low performance — drives the alert banner
export const atRiskStudents = students.filter(s => s.status === 'at-risk')
