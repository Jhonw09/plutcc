import DashboardLayout from './DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import {
  continueStudying,
  weekDays,
  weekActivity,
  recentActivity,
  weeklyGoal,
} from '../../data/studentDashboard'
import styles from './DashboardPage.module.css'

/* ── Component ── */
export default function DashboardPage() {
  const { user } = useAuth()
  const pct = Math.round((weeklyGoal.done / weeklyGoal.total) * 100)

  return (
    <DashboardLayout>

      {/* ── Banner ── */}
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <span className={styles.bannerTag}>Meta da semana</span>
          <h2 className={styles.bannerTitle}>Você tá indo bem, {user?.name ?? 'aluno'}! 🚀</h2>
          <p className={styles.bannerSub}>
            {weeklyGoal.done} de {weeklyGoal.total} questões concluídas — faltam só {weeklyGoal.total - weeklyGoal.done} pra bater a meta.
          </p>
          <div className={styles.bannerTrackWrap}>
            <div className={styles.bannerTrack}>
              <div className={styles.bannerFill} style={{ width: `${pct}%` }} />
            </div>
            <span className={styles.bannerPct}>{pct}%</span>
          </div>
        </div>
        {/* Decorative right side — abstract grid dots */}
        <div className={styles.bannerDeco} aria-hidden="true">
          <span className={styles.bannerCircle} />
        </div>
      </div>

      {/* ── Two-column row: Continue Studying + Weekly Progress ── */}
      <div className={styles.row}>

        {/* Continue Studying */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>De onde você parou</h3>
          <div className={styles.subjectList}>
            {continueStudying.map((s, i) => (
              <button key={i} className={styles.subjectCard} style={{ '--card-border': s.border }}>
                <div className={styles.subjectIconWrap} style={{ background: s.color }}>
                  <span className={styles.subjectIcon}>{s.icon}</span>
                </div>
                <div className={styles.subjectInfo}>
                  <span className={styles.subjectName}>{s.subject}</span>
                  <span className={styles.subjectTopic}>{s.topic}</span>
                  {/* Mini progress bar */}
                  <div className={styles.miniTrack}>
                    <div className={styles.miniFill} style={{ width: `${s.pct}%`, background: s.accent }} />
                  </div>
                </div>
                <span className={styles.subjectPct} style={{ color: s.accent }}>{s.pct}%</span>
                <span className={styles.subjectArrow}>→</span>
              </button>
            ))}
          </div>
        </section>

        {/* Weekly Progress */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Atividade semanal</h3>
          <div className={styles.barChart}>
            {weekDays.map((day, i) => (
              <div key={day} className={styles.barCol}>
                <div className={styles.barWrap}>
                  <div
                    className={`${styles.bar} ${weekActivity[i] === 0 ? styles.barEmpty : ''}`}
                    style={{ height: `${Math.max(weekActivity[i], 4)}%` }}
                  />
                </div>
                <span className={styles.barLabel}>{day}</span>
              </div>
            ))}
          </div>
          {/* Summary stats */}
          <div className={styles.statRow}>
            <div className={styles.stat}>
              <span className={styles.statValue}>4h 20m</span>
              <span className={styles.statLabel}>Tempo total</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>36</span>
              <span className={styles.statLabel}>Questões</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>5</span>
              <span className={styles.statLabel}>Aulas</span>
            </div>
          </div>
        </section>

      </div>

      {/* ── Recent Activity ── */}
      <section className={styles.section} style={{ marginTop: 0 }}>
        <h3 className={styles.sectionTitle}>Atividade recente</h3>
        <div className={styles.activityList}>
          {recentActivity.map((a, i) => (
            <div key={i} className={styles.activityItem}>
              <span className={styles.activityDot} style={{ background: a.color }} />
              <span className={styles.activityIcon}>{a.icon}</span>
              <span className={styles.activityText}>{a.text}</span>
              <span className={styles.activityTime}>{a.time}</span>
            </div>
          ))}
        </div>
      </section>

    </DashboardLayout>
  )
}
