import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useMinhasTrilhas } from '../hooks/useMinhasTrilhas'
import { useTrilhasAluno } from '../hooks/useTrilhasAluno'
import { usePerfilAprendizado } from '../hooks/usePerfilAprendizado'
import { getProgressoCompleto } from '../api/services/progressoService'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import Icon from '../components/ui/Icon'
import styles from './DesempenhoPage.module.css'

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

// Retorna índice 0=Seg … 6=Dom para uma string ISO ou Date
function dayIdx(dateStr) {
  return (new Date(dateStr).getDay() + 6) % 7
}

// Verifica se uma data está na semana atual (Seg–Dom)
function isThisWeek(dateStr) {
  const now  = new Date()
  const date = new Date(dateStr)
  const startOfWeek = new Date(now)
  startOfWeek.setHours(0, 0, 0, 0)
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)
  return date >= startOfWeek && date < endOfWeek
}

function Sk({ h = 20, r = 8, w }) {
  return (
    <div className={styles.sk} style={{ height: h, borderRadius: r, ...(w ? { width: w } : {}) }} />
  )
}

const STAT_COLORS = ['purple', 'green', 'blue', 'orange']

const FRASES_MOTIVACAO = [
  'Cada aula concluída é um passo a mais rumo ao seu objetivo. 🚀',
  'Consistência bate talento quando o talento não é consistente. 💪',
  'Você está construindo algo grande, uma aula de cada vez. ⭐',
  'O progresso de hoje é a base do sucesso de amanhã. 🎯',
]

export default function DesempenhoPage() {
  const { user } = useAuth()
  const { minhasTrilhas, loading: loadingTrilhas, getProgresso } = useMinhasTrilhas()
  const { concluidasSet } = useTrilhasAluno()
  const { metaSemanal, perfil, interesses } = usePerfilAprendizado()

  const [progressoRaw, setProgressoRaw]       = useState([])
  const [loadingProgresso, setLoadingProgresso] = useState(true)

  useEffect(() => {
    if (!user?.id) { setLoadingProgresso(false); return }
    getProgressoCompleto(user.id)
      .then(data => setProgressoRaw(data ?? []))
      .finally(() => setLoadingProgresso(false))
  }, [user?.id])

  const loading = loadingTrilhas || loadingProgresso

  // ── Estatísticas derivadas ────────────────────────────────────────────────
  const totalAulasConcluidas = concluidasSet.size
  const trilhasConcluidas    = minhasTrilhas.filter(t => getProgresso(t.id) === 100)
  const trilhasEmAndamento   = minhasTrilhas.filter(t => getProgresso(t.id) > 0 && getProgresso(t.id) < 100)

  // Atividade semanal: conta aulas concluídas por dia da semana atual
  const weekActivity = useMemo(() => {
    const arr = [0, 0, 0, 0, 0, 0, 0]
    progressoRaw.forEach(p => {
      if (p.concluidaEm && isThisWeek(p.concluidaEm)) {
        arr[dayIdx(p.concluidaEm)]++
      }
    })
    return arr
  }, [progressoRaw])

  const maxBar      = Math.max(...weekActivity, 1)
  const aulasSemana = weekActivity.reduce((a, b) => a + b, 0)
  const diasAtivos  = weekActivity.filter(v => v > 0).length
  const melhorDia   = Math.max(...weekActivity)

  // Meta: usa metaSemanal do perfil (default 5)
  const goalPct = Math.min(100, Math.round((aulasSemana / metaSemanal) * 100))

  // Frase motivacional baseada no progresso
  const frase = FRASES_MOTIVACAO[totalAulasConcluidas % FRASES_MOTIVACAO.length]

  const stats = [
    { icon: 'trophy',      value: trilhasConcluidas.length,  label: 'Trilhas concluídas',  sub: 'parabéns!',            color: 'orange' },
    { icon: 'fire',        value: trilhasEmAndamento.length, label: 'Em andamento',         sub: 'continue assim',       color: 'purple' },
    { icon: 'checkCircle', value: totalAulasConcluidas,      label: 'Aulas concluídas',     sub: 'no total',             color: 'green'  },
    { icon: 'bookOpen',    value: minhasTrilhas.length,      label: 'Matriculado em',       sub: 'trilhas',              color: 'blue'   },
  ]

  // Trilhas com progresso > 0, ordenadas por progresso desc
  const historico = useMemo(() =>
    [...minhasTrilhas]
      .filter(t => getProgresso(t.id) > 0)
      .sort((a, b) => getProgresso(b.id) - getProgresso(a.id))
      .slice(0, 5)
  , [minhasTrilhas, getProgresso])

  const firstName = user?.name?.split(' ')[0] ?? 'você'

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <h1 className={styles.title}>Seu desempenho</h1>
          <p className={styles.sub}>Olá, <strong>{firstName}</strong>. Veja como você está evoluindo.</p>
        </div>

        {/* ── Frase motivacional ── */}
        {!loading && totalAulasConcluidas > 0 && (
          <div className={styles.motivaBanner}>
            <span className={styles.motivaIcon}><Icon name="sparkles" size={16} /></span>
            <p className={styles.motivaText}>{frase}</p>
          </div>
        )}

        {/* ── Stat cards ── */}
        <div className={styles.statsGrid}>
          {stats.map((s, i) => (
            <div key={i} className={styles.statCard}>
              <span className={styles.statIconWrap} data-color={s.color}>
                <Icon name={s.icon} size={20} />
              </span>
              <div className={styles.statBody}>
                {loading ? <Sk h={26} w={40} /> : (
                  <p className={styles.statValue}>{s.value}</p>
                )}
                <p className={styles.statLabel}>{s.label}</p>
                <p className={styles.statSub}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Row: gráfico + meta ── */}
        <div className={styles.row}>

          {/* Atividade semanal */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <p className={styles.cardTitle}>Atividade esta semana</p>
              {aulasSemana > 0 && (
                <span className={styles.cardBadge}>{aulasSemana} aula{aulasSemana !== 1 ? 's' : ''}</span>
              )}
            </div>

            {loading ? (
              <div className={styles.barChart}>
                {WEEK_DAYS.map(d => (
                  <div key={d} className={styles.barCol}>
                    <div className={styles.barWrap}>
                      <Sk h={Math.random() * 60 + 20} r={4} />
                    </div>
                    <span className={styles.barLabel}>{d}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.barChart}>
                {WEEK_DAYS.map((day, i) => {
                  const isToday = i === (new Date().getDay() + 6) % 7
                  return (
                    <div key={day} className={styles.barCol}>
                      <div className={styles.barWrap}>
                        {weekActivity[i] > 0 && (
                          <span className={styles.barCount}>{weekActivity[i]}</span>
                        )}
                        <div
                          className={`${styles.bar} ${weekActivity[i] === 0 ? styles.barEmpty : ''} ${isToday ? styles.barToday : ''}`}
                          style={{ height: `${(weekActivity[i] / maxBar) * 100}%` }}
                        />
                      </div>
                      <span className={`${styles.barLabel} ${isToday ? styles.barLabelToday : ''}`}>{day}</span>
                    </div>
                  )
                })}
              </div>
            )}

            <div className={styles.chartStats}>
              <div className={styles.chartStat}>
                <span className={styles.chartStatValue}>{loading ? '—' : diasAtivos}</span>
                <span className={styles.chartStatLabel}>Dias ativos</span>
              </div>
              <div className={styles.chartStatDivider} />
              <div className={styles.chartStat}>
                <span className={styles.chartStatValue}>{loading ? '—' : melhorDia}</span>
                <span className={styles.chartStatLabel}>Melhor dia</span>
              </div>
              <div className={styles.chartStatDivider} />
              <div className={styles.chartStat}>
                <span className={styles.chartStatValue}>{loading ? '—' : aulasSemana}</span>
                <span className={styles.chartStatLabel}>Total semana</span>
              </div>
            </div>
          </div>

          {/* Meta da semana */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <p className={styles.cardTitle}>Meta semanal</p>
              <span className={styles.cardBadge}>{metaSemanal} aulas</span>
            </div>

            <div className={styles.goalCircleWrap}>
              <div className={styles.goalCircle}>
                <svg viewBox="0 0 80 80" className={styles.goalSvg}>
                  <circle cx="40" cy="40" r="32" className={styles.goalTrackCircle} />
                  <circle
                    cx="40" cy="40" r="32"
                    className={`${styles.goalFillCircle} ${goalPct === 100 ? styles.goalFillDone : ''}`}
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - (loading ? 0 : goalPct) / 100)}`}
                  />
                </svg>
                <div className={styles.goalCircleInner}>
                  {goalPct === 100
                    ? <span className={styles.goalEmoji}>🏆</span>
                    : <span className={styles.goalPct}>{loading ? '—' : `${goalPct}%`}</span>
                  }
                </div>
              </div>
            </div>

            <p className={styles.goalText}>
              {loading ? <Sk h={14} /> : (
                goalPct >= 100
                  ? <><strong>Meta atingida!</strong> Você concluiu {aulasSemana} aulas essa semana. 🎉</>
                  : <><strong>{aulasSemana}</strong> de <strong>{metaSemanal}</strong> aulas concluídas</>
              )}
            </p>

            <div className={`${styles.goalHint} ${goalPct >= 100 ? styles.goalHintDone : ''}`}>
              {loading ? <Sk h={12} /> : (
                goalPct >= 100
                  ? 'Incrível! Você superou a meta desta semana.'
                  : `Faltam ${metaSemanal - aulasSemana} aula${metaSemanal - aulasSemana !== 1 ? 's' : ''} para bater a meta.`
              )}
            </div>
          </div>
        </div>

        {/* ── Progresso por trilha ── */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <p className={styles.cardTitle}>Progresso por trilha</p>
            {trilhasConcluidas.length > 0 && (
              <span className={styles.cardBadge}>{trilhasConcluidas.length} concluída{trilhasConcluidas.length !== 1 ? 's' : ''} ✓</span>
            )}
          </div>

          {loading ? (
            <div className={styles.trilhasList}>
              {[0, 1, 2].map(i => (
                <div key={i} className={styles.trilhaRow}>
                  <Sk h={14} w={120} />
                  <Sk h={6} r={3} />
                </div>
              ))}
            </div>
          ) : historico.length === 0 ? (
            <div className={styles.emptyState}>
              <Icon name="bookOpen" size={32} style={{ opacity: .2 }} />
              <p>Conclua aulas nas trilhas para ver seu progresso aqui.</p>
            </div>
          ) : (
            <div className={styles.trilhasList}>
              {historico.map(t => {
                const pct  = getProgresso(t.id)
                const done = pct === 100
                return (
                  <div key={t.id} className={styles.trilhaRow}>
                    <div className={styles.trilhaInfo}>
                      <span className={styles.trilhaNome}>{t.nome}</span>
                      <span className={`${styles.trilhaPct} ${done ? styles.trilhaPctDone : ''}`}>
                        {done ? '✓ Concluída' : `${pct}%`}
                      </span>
                    </div>
                    <div className={styles.trilhaTrack}>
                      <div
                        className={`${styles.trilhaFill} ${done ? styles.trilhaFillDone : ''}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Perfil do aluno ── */}
        {perfil && (
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <p className={styles.cardTitle}>Seu perfil de aprendizado</p>
              <span className={styles.cardBadge}>
                {perfil.objetivo === 'ENEM' ? 'ENEM' : perfil.objetivo === 'VESTIBULAR' ? 'Vestibular' : perfil.objetivo === 'REFORCO' ? 'Reforço' : 'Faculdade'}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              {perfil.ritmo && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text-muted)' }}>Ritmo</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                    {perfil.ritmo === 'INTENSO' ? '🏃 Intenso' : perfil.ritmo === 'LEVE' ? '🐢 Leve' : '🚶 Moderado'}
                  </span>
                </div>
              )}
              {perfil.nivel && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text-muted)' }}>Nível</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                    {perfil.nivel === 'BASICO' ? 'Básico' : perfil.nivel === 'INTERMEDIARIO' ? 'Intermediário' : 'Avançado'}
                  </span>
                </div>
              )}
              {perfil.horasSemana && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text-muted)' }}>Horas/semana</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{perfil.horasSemana}h</span>
                </div>
              )}
            </div>
            {interesses.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text-muted)' }}>Matérias de interesse</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {interesses.map(m => (
                    <span key={m} style={{ fontSize: 12, color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, padding: '3px 10px', fontWeight: 500 }}>{m}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}
