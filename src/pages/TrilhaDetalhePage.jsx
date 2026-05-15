import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import { getTrilhaById } from '../api/services/trilhaService'
import { getAulasByTrilha } from '../api/services/aulaService'
import { useMatricula } from '../hooks/useMatricula'
import Icon from '../components/ui/Icon'
import styles from './TrilhaDetalhePage.module.css'

const SUBJECT = {
  Matemática:  { icon: 'math',    color: '#818cf8', bg: 'rgba(99,102,241,.15)'  },
  Português:   { icon: 'book',    color: '#60a5fa', bg: 'rgba(59,130,246,.15)'  },
  Química:     { icon: 'flask',   color: '#34d399', bg: 'rgba(16,185,129,.15)'  },
  Biologia:    { icon: 'dna',     color: '#4ade80', bg: 'rgba(34,197,94,.15)'   },
  Física:      { icon: 'zap',     color: '#fbbf24', bg: 'rgba(245,158,11,.15)'  },
  Geografia:   { icon: 'globe',   color: '#38bdf8', bg: 'rgba(14,165,233,.15)'  },
  História:    { icon: 'scroll',  color: '#fb923c', bg: 'rgba(249,115,22,.15)'  },
  Inglês:      { icon: 'globe',   color: '#a78bfa', bg: 'rgba(139,92,246,.15)'  },
  Artes:       { icon: 'palette', color: '#f472b6', bg: 'rgba(236,72,153,.15)'  },
  Informática: { icon: 'monitor', color: '#22d3ee', bg: 'rgba(6,182,212,.15)'   },
  Filosofia:   { icon: 'brain',   color: '#c084fc', bg: 'rgba(168,85,247,.15)'  },
  Sociologia:  { icon: 'scale',   color: '#94a3b8', bg: 'rgba(100,116,139,.15)' },
}
const SUBJECT_DEFAULT = { icon: 'bookOpen', color: '#a78bfa', bg: 'rgba(139,92,246,.15)' }

const NIVEL_STYLE = {
  Básico:        { color: '#4ade80', bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.3)'  },
  Intermediário: { color: '#fbbf24', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)' },
  Avançado:      { color: '#f87171', bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.3)'  },
  BASICO:        { color: '#4ade80', bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.3)'  },
  INTERMEDIARIO: { color: '#fbbf24', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)' },
  AVANCADO:      { color: '#f87171', bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.3)'  },
}

function ConfirmModal({ onConfirm, onCancel, loading }) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.confirmBox} onClick={e => e.stopPropagation()}>
        <h3 className={styles.confirmTitle}>Sair da trilha?</h3>
        <p className={styles.confirmText}>
          Seu progresso será mantido, mas você precisará se matricular novamente para continuar.
        </p>
        <div className={styles.confirmActions}>
          <button className={styles.btnCancel} onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button className={styles.btnDanger} onClick={onConfirm} disabled={loading}>
            {loading ? 'Saindo...' : 'Sair da trilha'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TrilhaDetalhePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { matriculado, loadingCheck, loadingAction, error: matriculaError, matricular, desmatricular } = useMatricula(id)

  const [trilha,  setTrilha]  = useState(null)
  const [aulas,   setAulas]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [confirmSair, setConfirmSair] = useState(false)
  const [actionError, setActionError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [trilhaData, aulasData] = await Promise.allSettled([
          getTrilhaById(id),
          getAulasByTrilha(id),
        ])
        if (trilhaData.status === 'fulfilled') setTrilha(trilhaData.value)
        else throw new Error('Trilha não encontrada.')
        if (aulasData.status === 'fulfilled') setAulas(aulasData.value)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleMatricular() {
    setActionError(null)
    try {
      await matricular()
      navigate(`/dashboard/trilha/${id}`)
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function handleDesmatricular() {
    setActionError(null)
    try {
      await desmatricular()
      setConfirmSair(false)
      navigate('/dashboard/trilhas')
    } catch (err) {
      setActionError(err.message)
      setConfirmSair(false)
    }
  }

  if (loading || loadingCheck) {
    return (
      <DashboardLayout>
        <div className={styles.loadingWrap}>
          <Icon name="hourglass" size={28} style={{ opacity: .4, color: 'var(--text-muted)' }} />
          <p>Carregando trilha...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !trilha) {
    return (
      <DashboardLayout>
        <div className={styles.loadingWrap}>
          <Icon name="alertCircle" size={28} style={{ opacity: .5, color: 'var(--text-muted)' }} />
          <p>{error ?? 'Trilha não encontrada.'}</p>
          <button className={styles.btnBack} onClick={() => navigate('/dashboard/trilhas')}>
            Voltar
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const subj  = SUBJECT[trilha.disciplina] ?? SUBJECT_DEFAULT
  const nivel = NIVEL_STYLE[trilha.nivel]  ?? NIVEL_STYLE['BASICO']

  return (
    <DashboardLayout>
      <div className={styles.page}>

        <button className={styles.btnBack} onClick={() => navigate('/dashboard/trilhas')}>
          <Icon name="chevronRight" size={14} style={{ transform: 'rotate(180deg)' }} />
          Voltar para trilhas
        </button>

        {/* ── Hero da trilha ── */}
        <div className={styles.hero} style={{ '--subj-bg': subj.bg, '--subj-color': subj.color }}>
          <div className={styles.heroIcon} style={{ background: subj.bg, color: subj.color }}>
            <Icon name={subj.icon} size={40} />
          </div>
          <div className={styles.heroInfo}>
            <div className={styles.heroMeta}>
              <span className={styles.heroDisciplina} style={{ color: subj.color }}>
                {trilha.disciplina ?? 'Geral'}
              </span>
              {trilha.nivel && (
                <span className={styles.heroNivel}
                  style={{ color: nivel.color, background: nivel.bg, borderColor: nivel.border }}>
                  {trilha.nivel}
                </span>
              )}
              {trilha.tipo && (
                <span className={styles.heroTipo}>{trilha.tipo}</span>
              )}
            </div>
            <h1 className={styles.heroTitle}>{trilha.nome}</h1>
            {trilha.professorNome && (
              <p className={styles.heroProf}>
                <Icon name="user" size={13} />
                {trilha.professorNome}
              </p>
            )}
          </div>
        </div>

        {/* ── Grid: info + ação ── */}
        <div className={styles.grid}>

          {/* Coluna esquerda: descrição + aulas */}
          <div className={styles.colLeft}>
            {trilha.descricao && (
              <div className={styles.card}>
                <p className={styles.cardLabel}>Sobre esta trilha</p>
                <p className={styles.descText}>{trilha.descricao}</p>
              </div>
            )}

            <div className={styles.card}>
              <p className={styles.cardLabel}>Conteúdo</p>
              {aulas.length === 0 ? (
                <p className={styles.emptyAulas}>Nenhuma aula disponível ainda.</p>
              ) : (
                <div className={styles.aulasList}>
                  {aulas.map((aula, i) => (
                    <div key={aula.id} className={styles.aulaItem}>
                      <span className={styles.aulaNum}>{i + 1}</span>
                      <span className={styles.aulaTitulo}>{aula.titulo}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Coluna direita: stats + CTA */}
          <div className={styles.colRight}>
            <div className={styles.ctaCard}>
              <div className={styles.ctaStats}>
                <div className={styles.ctaStat}>
                  <span className={styles.ctaStatVal}>{aulas.length}</span>
                  <span className={styles.ctaStatLbl}>Aulas</span>
                </div>
                <div className={styles.ctaStatDivider} />
                <div className={styles.ctaStat}>
                  <span className={styles.ctaStatVal}>{trilha.nivel ?? '—'}</span>
                  <span className={styles.ctaStatLbl}>Nível</span>
                </div>
                <div className={styles.ctaStatDivider} />
                <div className={styles.ctaStat}>
                  <span className={styles.ctaStatVal}>{trilha.tipo ?? 'Pública'}</span>
                  <span className={styles.ctaStatLbl}>Tipo</span>
                </div>
              </div>

              {(actionError || matriculaError) && (
                <p className={styles.errorMsg}>{actionError || matriculaError}</p>
              )}

              {matriculado ? (
                <>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => navigate(`/dashboard/trilha/${id}`)}
                  >
                    <Icon name="play" size={15} />
                    Continuar trilha
                  </button>
                  <button
                    className={styles.btnDangerOutline}
                    onClick={() => setConfirmSair(true)}
                    disabled={loadingAction}
                  >
                    <Icon name="doorOpen" size={14} />
                    Sair da trilha
                  </button>
                </>
              ) : (
                <button
                  className={styles.btnPrimary}
                  onClick={handleMatricular}
                  disabled={loadingAction}
                >
                  {loadingAction
                    ? 'Matriculando...'
                    : <><Icon name="graduationCap" size={15} /> Matricular-se</>}
                </button>
              )}

              <p className={styles.ctaHint}>
                {matriculado
                  ? 'Você está matriculado nesta trilha.'
                  : 'Gratuito · Acesso imediato após matrícula'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {confirmSair && (
        <ConfirmModal
          onConfirm={handleDesmatricular}
          onCancel={() => setConfirmSair(false)}
          loading={loadingAction}
        />
      )}
    </DashboardLayout>
  )
}
