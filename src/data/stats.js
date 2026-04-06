export const stats = [
  { id: 'alunos',   value: 5000000, label: 'Alunos ativos',     suffix: '+', format: n => (n / 1e6).toFixed(1) + 'M' },
  { id: 'escolas',  value: 20000,   label: 'Escolas parceiras', suffix: '+', format: n => (n / 1e3).toFixed(0) + 'K' },
  { id: 'questoes', value: 500000,  label: 'Questões no banco', suffix: '+', format: n => (n / 1e3).toFixed(0) + 'K' },
  { id: 'aulas',    value: 10000,   label: 'Videoaulas',        suffix: '+', format: n => (n / 1e3).toFixed(0) + 'K' },
]

export const logos = [
  { name: 'Objetivo', color: '#3B82F6' },
  { name: 'Anglo',    color: '#EF4444' },
  { name: 'Poliedro', color: '#22C55E' },
  { name: 'COC',      color: '#F59E0B' },
  { name: 'SEB',      color: '#3B82F6' },
  { name: 'Pitágoras',color: '#EF4444' },
  { name: 'Marista',  color: '#22C55E' },
  { name: 'Positivo', color: '#F59E0B' },
]
