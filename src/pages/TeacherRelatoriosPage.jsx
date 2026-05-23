import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import TeacherLayout from '../components/teacher/TeacherLayout'
import Icon from '../components/ui/Icon'
import { useAuth } from '../context/AuthContext'
import { useTrilhas } from '../hooks/useTrilhas'
import { getResumoProfessor } from '../api/services/matriculaService'
import styles from './TeacherRelatoriosPage.module.css'

const NIVEL_LABEL = {
  BASICO:        'Básico',
  INTERMEDIARIO: 'Intermediário',
  AVANCADO:      'Avançado',
  Fundamental:   'Fundamental',
  Médio:         'Médio',
  Vestibular:    'Vestibular',
}

const NIVEL_STYLE = {
  BASICO:        { color: '#4ade80', bg: 'rgba(34,197,94,.12)'   },
  INTERMEDIARIO: { color: '#fbbf24', bg: 'rgba(245,158,11,.12)'  },
  AVANCADO:      { color: '#f87171', bg: 'rgba(239,68,68,.12)'   },
  Fundamental:   { color: '#4ade80', bg: 'rgba(34,197,94,.12)'   },
  Médio:         { color: '#fbbf24', bg: 'rgba(245,158,11,.12)'  },
  Vestibular:    { color: '#f87171', bg: 'rgba(239,68,68,.12)'   },
}

function Sk({ h = 60, r = 12 }) {
  return <div className={styles.sk} style={{ height: h, borderRadius: r }} />
}

export default function TeacherRelatoriosPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { trilhas, loading: loadingTrilhas } = useTrilhas()

  const [resumo,        setResumo]        = useState(null)
  const [loadingResumo, setLoadingResumo] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    getResumoProfessor(user.id)
      .then(setResumo)
      .finally(() => setLoadingResumo(false))
  }, [user?.id])

  const publicCount  = useMemo(() => trilhas.filter(t => t.tipo === 'PUBLICA').length,  [trilhas])
  const privadaCount = useMemo(() => trilhas.filter(t => t.tipo === 'PRIVADA').length, [trilhas])

  const stats = [
    { icon: 'school',   label: 'Trilhas criadas',    value: loadingTrilhas ? '—' : trilhas.length,                   color: 'purple' },
    { icon: 'users',    label: 'Alunos matriculados', value: loadingResumo  ? '—' : (resumo?.totalAlunos ?? 0),       color: 'blue'   },
    { icon: 'globe',    label: 'Trilhas públicas',    value: loadingTrilhas ? '—' : publicCount,                      color: 'green'  },
    { icon: 'lock',     label: 'Trilhas privadas',    value: loadingTrilhas ? '—' : privadaCount,                     color: 'orange' },
  ]

  const loading = loadingTrilhas || loadingResumo

  return (
    <TeacherLayout>
      <div className={styles.page}>

        <div className={styles.header}>
          <h1 className={styles.title}>Visão geral</h1>
          <p className={styles.sub}>Resumo das suas trilhas e do alcance do seu conteúdo.</p>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {stats.map((s, i) => (
            <div key={i} className={styles.statCard}>
              <span className={styles.statIconWrap} data-color={s.color}>
                <Icon name={s.icon} size={20} />
              </span>
              <div>
                <p className={styles.statValue}>{s.value}</p>
                <p className={styles.statLabel}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lista de trilhas */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <p className={styles.cardTitle}>Suas trilhas</p>
            <button className={styles.linkBtn} onClick={() => navigate('/teacher-dashboard')}>
              Gerenciar →
            </button>
          </div>

          {loading ? (
            <div className={styles.skList}>
              {[0,1,2].map(i => <Sk key={i} h={64} />)}
            </div>
          ) : trilhas.length === 0 ? (
            <div className={styles.empty}>
              <Icon name="school" size={28} style={{ opacity: .25 }} />
              <p>Nenhuma trilha criada ainda.</p>
            </div>
          ) : (
            <div className={styles.trilhasList}>
              {trilhas.map(t => {
                const nivel = NIVEL_STYLE[t.nivel] ?? NIVEL_STYLE['BASICO']
                const label = NIVEL_LABEL[t.nivel] ?? t.nivel
                const alunosCount = resumo?.trilhas?.find(r => r.id === t.id)?.totalAlunos ?? '—'
                return (
                  <div
                    key={t.id}
                    className={styles.trilhaRow}
                    onClick={() => navigate(`/professor/trilha/${t.id}`, { state: t })}
                  >
                    <div className={styles.trilhaInfo}>
                      <span className={styles.trilhaNome}>{t.nome}</span>
                      <span className={styles.trilhaDisciplina}>{t.disciplina}</span>
                    </div>
                    <div className={styles.trilhaBadges}>
                      {t.nivel && (
                        <span className={styles.badge} style={{ color: nivel.color, background: nivel.bg }}>
                          {label}
                        </span>
                      )}
                      <span className={`${styles.badge} ${t.tipo === 'PUBLICA' ? styles.badgePublic : styles.badgePrivate}`}>
                        <Icon name={t.tipo === 'PUBLICA' ? 'globe' : 'lock'} size={11} />
                        {t.tipo === 'PUBLICA' ? 'Pública' : 'Privada'}
                      </span>
                    </div>
                    <div className={styles.trilhaAlunos}>
                      <Icon name="users" size={13} style={{ opacity: .5 }} />
                      <span>{alunosCount} aluno{alunosCount !== 1 ? 's' : ''}</span>
                    </div>
                    <Icon name="chevronRight" size={14} style={{ opacity: .3, flexShrink: 0 }} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </TeacherLayout>
  )
}
