import DashboardLayout from './DashboardLayout'
import styles from './DashboardPage.module.css'

/* ── Static mock data (replace with API calls later) ── */
const continueStudying = [
  { icon: '📐', subject: 'Matemática', topic: 'Funções Quadráticas',   pct: 68, color: 'rgba(108,92,231,0.12)',  border: 'rgba(108,92,231,0.2)',  accent: '#a78bfa' },
  { icon: '⚗️', subject: 'Química',    topic: 'Reações Orgânicas',     pct: 45, color: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.2)',   accent: '#86efac' },
  { icon: '📖', subject: 'Português',  topic: 'Interpretação Textual', pct: 91, color: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.2)',  accent: '#93c5fd' },
  { icon: '🧬', subject: 'Biologia',   topic: 'Genética Mendeliana',   pct: 32, color: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.2)',   accent: '#fca5a5' },
]

const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const weekActivity = [60, 85, 40, 100, 70, 30, 0] // % of daily goal

const recentActivity = [
  { icon: '✅', text: 'Completou "Funções Quadráticas — Parte 2"',  time: 'há 2h',   color: 'var(--success)' },
  { icon: '📝', text: 'Respondeu 20 questões de Química',           time: 'há 5h',   color: '#93c5fd'       },
  { icon: '🏆', text: 'Conquistou: 7 dias seguidos de estudo',      time: 'ontem',   color: '#fbbf24'       },
  { icon: '📋', text: 'Iniciou simulado ENEM — Ciências da Natureza', time: 'ontem', color: '#a78bfa'       },
]

const weeklyGoal = { done: 36, total: 50 }

/* ── Component ── */
export default function DashboardPage({ user }) {
  const pct = Math.round((weeklyGoal.done / weeklyGoal.total) * 100)

  return (
    <DashboardLayout user={user}>

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
