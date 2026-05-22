import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'
import { useMinhasTrilhas } from '../../hooks/useMinhasTrilhas'
import { useTrilhasAluno } from '../../hooks/useTrilhasAluno'
import { recentActivity, weeklyGoal } from '../../data/studentDashboard'
import { STUDENT_ROUTES } from '../../constants/routes'
import Icon from '../ui/Icon'
import styles from './DashboardPage.module.css'

const SUBJECT_ICON = {
  Matemática: 'math', Português: 'book', Química: 'flask', Biologia: 'dna',
  Física: 'zap', Geografia: 'globe', História: 'scroll', Inglês: 'globe',
  Artes: 'palette', Informática: 'monitor', Filosofia: 'brain', Sociologia: 'scale',
}

const ACTIVITY_ICON = {
  checkCircle: 'checkCircle',
  pencil:      'pencil',
  trophy:      'trophy',
  clipboard:   'clipboard',
}

function Sk({ h, r = 12 }) {
  return <div className={styles.sk} style={{ height: h, borderRadius: r }} />
}

export default function DashboardPage() {
  const navigate = useNavigate()
  // useMinhasTrilhas ja busca getTrilhasPublicas internamente.
  // todasTrilhas vem do hook para evitar request duplicado.
  const { minhasTrilhas, todasTrilhas, loading, error: trilhasError } = useMinhasTrilhas()
  const { getProgresso } = useTrilhasAluno()

  const concluidas         = minhasTrilhas.filter(t => getProgresso(t.id, 10) === 100)
  const destaque           = minhasTrilhas.find(t => getProgresso(t.id, 10) < 100) ?? minhasTrilhas[0]
  const destaquePct        = destaque ? getProgresso(destaque.id, 10) : 0
  const goalPct            = Math.round((weeklyGoal.done / weeklyGoal.total) * 100)

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ── 1. Card principal: Continuar trilha ── */}
        <div className={styles.destaqueCard}>
          <div className={styles.destaqueInner}>
            <div className={styles.destaqueLeft}>
              <span className={styles.destaqueTag}>Em andamento</span>

              {loading ? (
                <><Sk h={26} r={6} /><Sk h={14} r={6} /></>
              ) : destaque ? (
                <>
                  <h2 className={styles.destaqueTitle}>{destaque.nome}</h2>
                  <p className={styles.destaqueMeta}>
                    {[destaque.disciplina, destaque.professorNome].filter(Boolean).join(' · ')}
                  </p>
                  <div className={styles.destaqueProgressRow}>
                    <div className={styles.destaqueTrack}>
                      <div className={styles.destaqueFill} style={{ width: `${destaquePct}%` }} />
                    </div>
                    <span className={styles.destaquePct}>{destaquePct}%</span>
                  </div>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => navigate(`/dashboard/trilha/${destaque.id}`)}
                  >
                    Continuar trilha <Icon name="chevronRight" size={15} />
                  </button>
                </>
              ) : (
                <>
                  <h2 className={styles.destaqueTitle}>Nenhuma trilha iniciada</h2>
                  <p className={styles.destaqueMeta}>Explore as trilhas disponíveis e comece agora.</p>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => navigate(STUDENT_ROUTES.trilhas)}
                  >
                    Explorar trilhas <Icon name="chevronRight" size={15} />
                  </button>
                </>
              )}
            </div>

            <div className={styles.destaqueRight} aria-hidden>
              <Icon
                name={destaque ? (SUBJECT_ICON[destaque.disciplina] ?? 'bookOpen') : 'compass'}
                size={48}
              />
            </div>
          </div>
        </div>

        {/* ── 2. Resumo rápido: 3 números ── */}
        <div className={styles.statsRow}>
          {loading ? [0,1,2].map(i => <Sk key={i} h={80} />) : (
            <>
              <div className={styles.statCard}>
                <span className={styles.statIconWrap} data-color="purple">
                  <Icon name="fire" size={18} />
                </span>
                <div>
                  <p className={styles.statVal}>{minhasTrilhas.length}</p>
                  <p className={styles.statLbl}>Em andamento</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIconWrap} data-color="green">
                  <Icon name="checkCircle" size={18} />
                </span>
                <div>
                  <p className={styles.statVal}>{concluidas.length}</p>
                  <p className={styles.statLbl}>Trilhas concluídas</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIconWrap} data-color="blue">
                  <Icon name="bookOpen" size={18} />
                </span>
                <div>
                  <p className={styles.statVal}>{todasTrilhas.length}</p>
                  <p className={styles.statLbl}>Trilhas disponíveis</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── 3 + 4. Meta semanal + Atividade recente ── */}
        <div className={styles.bottomRow}>

          {/* Meta semanal */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardLabel}>Meta semanal</span>
              <button className={styles.linkBtn} onClick={() => navigate(STUDENT_ROUTES.desempenho)}>
                Ver desempenho →
              </button>
            </div>
            {loading ? <Sk h={72} /> : (
              <>
                <div className={styles.goalNums}>
                  <span className={styles.goalBig}>{weeklyGoal.done}</span>
                  <span className={styles.goalOf}>/ {weeklyGoal.total} min</span>
                  <span className={styles.goalPct}>{goalPct}%</span>
                </div>
                <div className={styles.goalTrack}>
                  <div className={styles.goalFill} style={{ width: `${goalPct}%` }} />
                </div>
                <p className={styles.goalHint}>
                  {goalPct >= 100
                    ? 'Meta atingida esta semana!'
                    : `Faltam ${weeklyGoal.total - weeklyGoal.done} min para atingir sua meta`}
                </p>
              </>
            )}
          </div>

          {/* Atividade recente */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardLabel}>Atividade recente</span>
              <button className={styles.linkBtn} onClick={() => navigate(STUDENT_ROUTES.desempenho)}>
                Ver tudo →
              </button>
            </div>
            {loading ? (
              <div className={styles.actList}>
                {[0,1,2,3].map(i => <Sk key={i} h={34} r={8} />)}
              </div>
            ) : (
              <div className={styles.actList}>
                {recentActivity.slice(0, 4).map((item, i) => (
                  <div key={i} className={styles.actItem}>
                    <span className={styles.actIcon} style={{ color: item.color }}>
                      <Icon name={ACTIVITY_ICON[item.icon] ?? 'checkCircle'} size={14} />
                    </span>
                    <span className={styles.actText}>{item.text}</span>
                    <span className={styles.actTime}>{item.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  )
}
