import TeacherLayout from '../components/teacher/TeacherLayout'
import Icon from '../components/ui/Icon'
import { recentActivity, students } from '../data/teacherDashboard'
import styles from './TeacherRelatoriosPage.module.css'

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const WEEK_DATA = [45, 72, 30, 88, 60, 20, 0]

const MOCK_STATS = [
  { icon: 'users',      value: '128', label: 'Total de alunos',      sub: '+4 esta semana'       },
  { icon: 'school',     value: '6',   label: 'Trilhas ativas',       sub: '2 trilhas noturnas'   },
  { icon: 'lineChart',  value: '74%', label: 'Progresso médio',      sub: '+3% vs mês passado'   },
  { icon: 'checkCircle',value: '312', label: 'Atividades concluídas', sub: '48 esta semana'      },
]

const STATUS_STYLE = {
  active:   { color: '#4ade80', bg: 'rgba(34,197,94,.12)',  label: 'Ativo'    },
  behind:   { color: '#fbbf24', bg: 'rgba(245,158,11,.12)', label: 'Atrasado' },
  'at-risk':{ color: '#f87171', bg: 'rgba(239,68,68,.12)',  label: 'Em risco' },
}

export default function TeacherRelatoriosPage() {
  const maxBar   = Math.max(...WEEK_DATA, 1)
  const total    = WEEK_DATA.reduce((a, b) => a + b, 0)
  const ativos   = WEEK_DATA.filter(v => v > 0).length
  const melhor   = Math.max(...WEEK_DATA)
  const media    = Math.round(total / 7)

  const engPct   = Math.round((ativos / 7) * 100)

  return (
    <TeacherLayout>
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Relatórios</h1>
          <p className={styles.sub}>Acompanhe o desempenho das suas turmas e o engajamento dos alunos.</p>
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

        {/* Row: engajamento semanal + meta de engajamento */}
        <div className={styles.row}>

          {/* Engajamento semanal */}
          <div className={styles.card}>
            <p className={styles.cardTitle}>Engajamento semanal (min ativos)</p>
            <div className={styles.barChart}>
              {WEEK_DAYS.map((day, i) => (
                <div key={day} className={styles.barCol}>
                  <div className={styles.barWrap}>
                    <div
                      className={`${styles.bar} ${WEEK_DATA[i] === 0 ? styles.barEmpty : ''}`}
                      style={{ height: `${(WEEK_DATA[i] / maxBar) * 100}%` }}
                    />
                  </div>
                  <span className={styles.barLabel}>{day}</span>
                </div>
              ))}
            </div>
            <div className={styles.chartStats}>
              <div className={styles.chartStat}>
                <span className={styles.chartStatValue}>{ativos}</span>
                <span className={styles.chartStatLabel}>Dias ativos</span>
              </div>
              <div className={styles.chartStatDivider} />
              <div className={styles.chartStat}>
                <span className={styles.chartStatValue}>{melhor}min</span>
                <span className={styles.chartStatLabel}>Pico</span>
              </div>
              <div className={styles.chartStatDivider} />
              <div className={styles.chartStat}>
                <span className={styles.chartStatValue}>{media}min</span>
                <span className={styles.chartStatLabel}>Média/dia</span>
              </div>
              <div className={styles.chartStatDivider} />
              <div className={styles.chartStat}>
                <span className={styles.chartStatValue}>{total}min</span>
                <span className={styles.chartStatLabel}>Total semana</span>
              </div>
            </div>
          </div>

          {/* Engajamento geral */}
          <div className={styles.card}>
            <p className={styles.cardTitle}>Engajamento geral</p>
            <div className={styles.goalCircleWrap}>
              <div className={styles.goalCircle}>
                <svg viewBox="0 0 80 80" className={styles.goalSvg}>
                  <circle cx="40" cy="40" r="34" className={styles.goalTrackCircle} />
                  <circle
                    cx="40" cy="40" r="34"
                    className={styles.goalFillCircle}
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - engPct / 100)}`}
                  />
                </svg>
                <div className={styles.goalCircleInner}>
                  <span className={styles.goalPct}>{engPct}%</span>
                </div>
              </div>
            </div>
            <p className={styles.goalText}>
              <strong>{ativos}</strong> de <strong>7</strong> dias com atividade registrada
            </p>
            <div className={styles.goalHint}>
              {engPct >= 80
                ? 'Excelente engajamento esta semana!'
                : `Incentive mais atividade nos dias sem engajamento.`}
            </div>
          </div>

        </div>

        {/* Tabela de alunos */}
        <div className={styles.card}>
          <p className={styles.cardTitle}>Desempenho dos alunos</p>
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Aluno</span>
              <span>Turma</span>
              <span>Progresso</span>
              <span>Status</span>
            </div>
            {students.map(s => {
              const st = STATUS_STYLE[s.status]
              return (
                <div key={s.id} className={styles.tableRow}>
                  <div className={styles.tableAvatar}>
                    <div className={styles.avatarCircle}>{s.avatar}</div>
                    <span className={styles.tableName}>{s.name}</span>
                  </div>
                  <span className={styles.tableClass}>{s.class}</span>
                  <div className={styles.tableProgress}>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${s.pct}%`, background: st.color }}
                      />
                    </div>
                    <span className={styles.progressPct} style={{ color: st.color }}>{s.pct}%</span>
                  </div>
                  <span className={styles.statusBadge} style={{ color: st.color, background: st.bg }}>
                    {st.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Atividade recente */}
        <div className={styles.card}>
          <p className={styles.cardTitle}>Histórico de atividades</p>
          <div className={styles.activityList}>
            {recentActivity.map((item, i) => (
              <div key={i} className={styles.activityItem}>
                <div className={styles.activityDot} style={{ background: item.color }} />
                <div className={styles.activityBody}>
                  <span className={styles.activityStudent}>{item.student}</span>
                  <span className={styles.activityAction}>{item.action}</span>
                </div>
                <span className={styles.activityTime}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </TeacherLayout>
  )
}
