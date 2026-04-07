import AdminLayout   from '../components/admin/AdminLayout'
import StatCard      from '../components/teacher/StatCard'
import ActivityItem  from '../components/teacher/ActivityItem'
import styles from './AdminDashboardPage.module.css'

/* ── Mock data — replace with API calls later ── */
const adminStats = [
  { id: 'users',    icon: '👥', label: 'Usuários totais',    value: '12.4K', delta: '+320 este mês',   deltaPositive: true  },
  { id: 'schools',  icon: '🏫', label: 'Escolas ativas',     value: '148',   delta: '+6 este mês',     deltaPositive: true  },
  { id: 'revenue',  icon: '💰', label: 'Receita mensal',     value: 'R$48K', delta: '+12% vs anterior', deltaPositive: true  },
  { id: 'issues',   icon: '🚨', label: 'Tickets abertos',    value: '7',     delta: '-3 vs ontem',     deltaPositive: false },
]

const recentActivity = [
  { id: 1, icon: '🏫', student: 'Escola Objetivo',    action: 'renovou contrato anual',              time: 'há 1h',    color: 'var(--success)' },
  { id: 2, icon: '👤', student: 'Prof. Carlos Lima',  action: 'criou 3 novas turmas',                time: 'há 2h',    color: '#a78bfa'        },
  { id: 3, icon: '🚨', student: 'Sistema',            action: 'erro 500 detectado em /api/progress', time: 'há 3h',    color: 'var(--danger)'  },
  { id: 4, icon: '💰', student: 'Escola Anglo',       action: 'pagamento confirmado — R$3.200',      time: 'ontem',    color: '#86efac'        },
  { id: 5, icon: '👥', student: '48 novos alunos',    action: 'cadastrados via importação CSV',      time: 'ontem',    color: '#93c5fd'        },
]

const systemStatus = [
  { label: 'API',          status: 'online',  latency: '42ms'  },
  { label: 'Banco de dados', status: 'online', latency: '8ms'  },
  { label: 'CDN de vídeos', status: 'online', latency: '120ms' },
  { label: 'Serviço de e-mail', status: 'degraded', latency: '980ms' },
]

export default function AdminDashboardPage({ user }) {
  return (
    <AdminLayout user={user}>

      {/* ── Welcome ── */}
      <div className={styles.welcome}>
        <h2 className={styles.welcomeTitle}>Painel Administrativo 🛡️</h2>
        <p className={styles.welcomeSub}>
          Visão geral da plataforma — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* ── Stats ── */}
      <div className={styles.statsGrid}>
        {adminStats.map(s => <StatCard key={s.id} {...s} />)}
      </div>

      {/* ── Two-column: activity + system status ── */}
      <div className={styles.row}>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Atividade recente</h3>
          {recentActivity.map(a => <ActivityItem key={a.id} {...a} />)}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Status do sistema</h3>
          <div className={styles.statusList}>
            {systemStatus.map(s => (
              <div key={s.label} className={styles.statusItem}>
                <span className={`${styles.statusDot} ${styles[s.status]}`} />
                <span className={styles.statusLabel}>{s.label}</span>
                <span className={styles.statusLatency}>{s.latency}</span>
                <span className={`${styles.statusBadge} ${styles[s.status]}`}>
                  {s.status === 'online' ? 'Online' : 'Degradado'}
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>

    </AdminLayout>
  )
}
