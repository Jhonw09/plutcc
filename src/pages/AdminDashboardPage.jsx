import AdminLayout   from '../components/admin/AdminLayout'
import StatCard      from '../components/teacher/StatCard'
import ActivityItem  from '../components/teacher/ActivityItem'
import { useAuth }   from '../context/AuthContext'
import { adminStats, adminActivity, systemStatus } from '../data/adminDashboard'
import styles from './AdminDashboardPage.module.css'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  return (
    <AdminLayout>

      {/* ── Welcome ── */}
      <div className={styles.welcome}>
        <h2 className={styles.welcomeTitle}>Painel Administrativo</h2>
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
          {adminActivity.map(a => <ActivityItem key={a.id} {...a} />)}
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
