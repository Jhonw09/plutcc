import DashboardLayout from '../components/dashboard/DashboardLayout'
import { weekDays, weekActivity, recentActivity, weeklyGoal } from '../data/studentDashboard'
import Icon from '../components/ui/Icon'
import styles from './DesempenhoPage.module.css'

const MOCK_STATS = [
  { icon: 'fire',      value: '7',   label: 'Dias seguidos',   sub: 'streak atual'        },
  { icon: 'clock',     value: '36',  label: 'Min esta semana', sub: `meta: ${weeklyGoal.total} min` },
  { icon: 'pencil',    value: '142', label: 'Questões',         sub: 'respondidas no total' },
  { icon: 'trophy',    value: '3',   label: 'Trilhas',          sub: 'concluídas'           },
]

export default function DesempenhoPage() {
  const maxBar = Math.max(...weekActivity, 1)
  const totalMin = weekActivity.reduce((a, b) => a + b, 0)
  const diasAtivos = weekActivity.filter(v => v > 0).length
  const melhorDia = Math.max(...weekActivity)
  const media = Math.round(totalMin / 7)
  const goalPct = Math.round((weeklyGoal.done / weeklyGoal.total) * 100)

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Desempenho</h1>
          <p className={styles.sub}>Acompanhe sua evolução e mantenha o ritmo de estudos.</p>
        </div>

        {/* Stat cards */}
        <div className={styles.statsGrid}>
          {MOCK_STATS.map((s, i) => (
            <div key={i} className={styles.statCard}>
              <span className={styles.statIcon}><Icon name={s.icon} size={22} /></span>
              <div>
                <p className={styles.statValue}>{s.value}</p>
                <p className={styles.statLabel}>{s.label}</p>
                <p className={styles.statSub}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Row: Atividade semanal + Meta */}
        <div className={styles.row}>

          {/* Atividade semanal */}
          <div className={styles.card}>
            <p className={styles.cardTitle}>Atividade semanal</p>
            <div className={styles.barChart}>
              {weekDays.map((day, i) => (
                <div key={day} className={styles.barCol}>
                  <div className={styles.barWrap}>
                    <div
                      className={`${styles.bar} ${weekActivity[i] === 0 ? styles.barEmpty : ''}`}
                      style={{ height: `${(weekActivity[i] / maxBar) * 100}%` }}
                    />
                  </div>
                  <span className={styles.barLabel}>{day}</span>
                </div>
              ))}
            </div>
            <div className={styles.chartStats}>
              <div className={styles.chartStat}>
                <span className={styles.chartStatValue}>{diasAtivos}</span>
                <span className={styles.chartStatLabel}>Dias ativos</span>
              </div>
              <div className={styles.chartStatDivider} />
              <div className={styles.chartStat}>
                <span className={styles.chartStatValue}>{melhorDia}min</span>
                <span className={styles.chartStatLabel}>Melhor dia</span>
              </div>
              <div className={styles.chartStatDivider} />
              <div className={styles.chartStat}>
                <span className={styles.chartStatValue}>{media}min</span>
                <span className={styles.chartStatLabel}>Média/dia</span>
              </div>
              <div className={styles.chartStatDivider} />
              <div className={styles.chartStat}>
                <span className={styles.chartStatValue}>{totalMin}min</span>
                <span className={styles.chartStatLabel}>Total semana</span>
              </div>
            </div>
          </div>

          {/* Meta da semana */}
          <div className={styles.card}>
            <p className={styles.cardTitle}>Meta da semana</p>
            <div className={styles.goalCircleWrap}>
              <div className={styles.goalCircle}>
                <svg viewBox="0 0 80 80" className={styles.goalSvg}>
                  <circle cx="40" cy="40" r="34" className={styles.goalTrackCircle} />
                  <circle
                    cx="40" cy="40" r="34"
                    className={styles.goalFillCircle}
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - goalPct / 100)}`}
                  />
                </svg>
                <div className={styles.goalCircleInner}>
                  <span className={styles.goalPct}>{goalPct}%</span>
                </div>
              </div>
            </div>
            <p className={styles.goalText}>
              <strong>{weeklyGoal.done}</strong> de <strong>{weeklyGoal.total}</strong> minutos concluídos
            </p>
            <div className={styles.goalHint}>
              {goalPct >= 100
                ? 'Meta atingida! Parabéns!'
                : `Faltam ${weeklyGoal.total - weeklyGoal.done} min para atingir sua meta.`}
            </div>
          </div>
        </div>

        {/* Atividade recente */}
        <div className={styles.card}>
          <p className={styles.cardTitle}>Histórico de atividades</p>
          <div className={styles.activityList}>
            {recentActivity.map((item, i) => (
              <div key={i} className={styles.activityItem}>
                <div className={styles.activityDot} style={{ background: item.color }} />
                <span className={styles.activityText}>{item.text}</span>
                <span className={styles.activityTime}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
