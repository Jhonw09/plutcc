// Replace each export with an API call when the backend is ready.

export const teacherStats = [
  { id: 'students',   icon: 'users',     label: 'Total de alunos',       value: '128',  delta: '+4 esta semana',     deltaPositive: true  },
  { id: 'classes',    icon: 'school',    label: 'Trilhas ativas',        value: '6',    delta: '2 trilhas noturnas', deltaPositive: null  },
  { id: 'progress',   icon: 'lineChart', label: 'Progresso médio',       value: '74%',  delta: '+3% vs mês passado', deltaPositive: true  },
  { id: 'activities', icon: 'checkCircle', label: 'Atividades concluídas', value: '312', delta: '48 esta semana',    deltaPositive: true  },
]

export const quickActions = [
  { id: 'create',   icon: 'plus',      label: 'Criar atividade',  desc: 'Nova tarefa ou prova para uma turma' },
  { id: 'students', icon: 'user',      label: 'Ver alunos',       desc: 'Lista completa com desempenho'       },
  { id: 'classes',  icon: 'clipboard', label: 'Gerenciar trilhas', desc: 'Editar trilhas e adicionar alunos'    },
  { id: 'reports',  icon: 'barChart',  label: 'Relatórios',       desc: 'Exportar dados de desempenho'        },
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
  { id: 1, icon: 'checkCircle', student: 'Ana Souza',      action: 'concluiu "Funções Quadráticas — Parte 2"', time: 'há 15min', color: 'var(--success)' },
  { id: 2, icon: 'pencil',      student: 'Bruno Lima',     action: 'enviou a atividade de Química',            time: 'há 1h',    color: '#93c5fd'        },
  { id: 3, icon: 'warning',     student: 'Diego Ferreira', action: 'não entregou a tarefa de História',        time: 'há 3h',    color: 'var(--danger)'  },
  { id: 4, icon: 'trophy',      student: 'Carla Mendes',   action: 'atingiu 100% em Interpretação Textual',    time: 'ontem',    color: '#fbbf24'        },
  { id: 5, icon: 'clipboard',   student: 'Elena Costa',    action: 'iniciou o simulado ENEM — Exatas',         time: 'ontem',    color: '#a78bfa'        },
]

export const atRiskStudents = students.filter(s => s.status === 'at-risk')
