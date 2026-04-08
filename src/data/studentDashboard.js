// Replace each export with an API call when the backend is ready.

export const continueStudying = [
  { icon: '📐', subject: 'Matemática', topic: 'Funções Quadráticas',   pct: 68, color: 'rgba(108,92,231,0.12)', border: 'rgba(108,92,231,0.2)', accent: '#a78bfa' },
  { icon: '⚗️', subject: 'Química',    topic: 'Reações Orgânicas',     pct: 45, color: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.2)',  accent: '#86efac' },
  { icon: '📖', subject: 'Português',  topic: 'Interpretação Textual', pct: 91, color: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.2)', accent: '#93c5fd' },
  { icon: '🧬', subject: 'Biologia',   topic: 'Genética Mendeliana',   pct: 32, color: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.2)',  accent: '#fca5a5' },
]

export const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export const weekActivity = [60, 85, 40, 100, 70, 30, 0] // % of daily goal

export const recentActivity = [
  { icon: '✅', text: 'Completou "Funções Quadráticas — Parte 2"',    time: 'há 2h',  color: 'var(--success)' },
  { icon: '📝', text: 'Respondeu 20 questões de Química',             time: 'há 5h',  color: '#93c5fd'       },
  { icon: '🏆', text: 'Conquistou: 7 dias seguidos de estudo',        time: 'ontem',  color: '#fbbf24'       },
  { icon: '📋', text: 'Iniciou simulado ENEM — Ciências da Natureza', time: 'ontem',  color: '#a78bfa'       },
]

export const weeklyGoal = { done: 36, total: 50 }
