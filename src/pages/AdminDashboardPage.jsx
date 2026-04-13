import AdminLayout   from '../components/admin/AdminLayout'
import Icon          from '../components/ui/Icon'
import { useAuth }   from '../context/AuthContext'
import { adminStats, adminActivity, systemStatus } from '../data/adminDashboard'
import styles from './AdminDashboardPage.module.css'

function StatCard({ icon, label, value, delta, deltaPositive }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statTop}>
        <span className={styles.statIcon}><Icon name={icon} size={18} /></span>
        <span className={`${styles.statDelta} ${
          deltaPositive === true  ? styles.deltaUp   :
          deltaPositive === false ? styles.deltaDown : styles.deltaNeutral
        }`}>{delta}</span>
      </div>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

function ActivityItem({ icon, student, action, time, color }) {
  return (
    <div className={styles.activityItem}>
      <span className={styles.activityIcon} style={{ color }}>
        <Icon name={icon} size={16} />
      </span>
      <div className={styles.activityBody}>
        <span className={styles.activityStudent}>{student}</span>
        <span className={styles.activityAction}>{action}</span>
      </div>
      <span className={styles.activityTime}>{time}</span>
    </div>
  )
}

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
