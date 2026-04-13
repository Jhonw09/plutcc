// Replace each export with an API call when the backend is ready.

export const adminStats = [
  { id: 'users',   icon: 'users',      label: 'Usuários totais', value: '12.4K', delta: '+320 este mês',    deltaPositive: true  },
  { id: 'schools', icon: 'school',     label: 'Escolas ativas',  value: '148',   delta: '+6 este mês',      deltaPositive: true  },
  { id: 'revenue', icon: 'dollar',     label: 'Receita mensal',  value: 'R$48K', delta: '+12% vs anterior', deltaPositive: true  },
  { id: 'issues',  icon: 'alertCircle',label: 'Tickets abertos', value: '7',     delta: '-3 vs ontem',      deltaPositive: false },
]

export const adminActivity = [
  { id: 1, icon: 'school',      student: 'Escola Objetivo',   action: 'renovou contrato anual',              time: 'há 1h',  color: 'var(--success)' },
  { id: 2, icon: 'user',        student: 'Prof. Carlos Lima', action: 'criou 3 novas trilhas',               time: 'há 2h',  color: '#a78bfa'        },
  { id: 3, icon: 'alertCircle', student: 'Sistema',           action: 'erro 500 detectado em /api/progress', time: 'há 3h',  color: 'var(--danger)'  },
  { id: 4, icon: 'dollar',      student: 'Escola Anglo',      action: 'pagamento confirmado — R$3.200',      time: 'ontem',  color: '#86efac'        },
  { id: 5, icon: 'users',       student: '48 novos alunos',   action: 'cadastrados via importação CSV',      time: 'ontem',  color: '#93c5fd'        },
]

export const systemStatus = [
  { label: 'API',               status: 'online',   latency: '42ms'  },
  { label: 'Banco de dados',    status: 'online',   latency: '8ms'   },
  { label: 'CDN de vídeos',     status: 'online',   latency: '120ms' },
  { label: 'Serviço de e-mail', status: 'degraded', latency: '980ms' },
]
