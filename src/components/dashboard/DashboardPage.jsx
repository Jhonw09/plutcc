import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'
import { useMinhasTrilhas } from '../../hooks/useMinhasTrilhas'
import { useAuth } from '../../context/AuthContext'
import { usePerfilAprendizado } from '../../hooks/usePerfilAprendizado'
import OnboardingPerfilPage from '../../pages/OnboardingPerfilPage'
import SpotlightTour from '../ui/SpotlightTour'
import { STUDENT_ROUTES } from '../../constants/routes'
import { api, ENDPOINTS } from '../../api/apiClient'
import Icon from '../ui/Icon'
import styles from './DashboardPage.module.css'

const SUBJECT_ICON = {
  Matemática: 'math', Português: 'book', Química: 'flask', Biologia: 'dna',
  Física: 'zap', Geografia: 'globe', História: 'scroll', Inglês: 'globe',
  Artes: 'palette', Informática: 'monitor', Filosofia: 'brain', Sociologia: 'scale',
}

// ─── Chaves de localStorage ───────────────────────────────────────────────────
const obKey   = (id) => `plut_student_onboarding_done_${id}`
const tourKey = (id) => `plut_tour_student_dashboard_${id}`

function isObDone(id)  { try { return localStorage.getItem(obKey(id)) === 'true' } catch { return false } }
function markObDone(id){ try { localStorage.setItem(obKey(id), 'true') } catch {} }

// ─── Onboarding steps ─────────────────────────────────────────────────────────
const OB_STEPS = [
  {
    icon: 'compass',
    title: 'Explore as trilhas',
    desc: 'Uma trilha é um conjunto de aulas organizadas em torno de um tema. Navegue pelo catálogo e encontre o que você quer aprender.',
    hint: 'Exemplo: "Matemática para o ENEM", "Introdução à Programação", "Redação nota 1000"',
  },
  {
    icon: 'bookOpen',
    title: 'Matricule-se e estude',
    desc: 'Ao se matricular em uma trilha, você tem acesso a todas as aulas. Estude no seu ritmo, quando e onde quiser.',
    hint: 'Seu progresso é salvo automaticamente. Pode pausar e continuar quando quiser.',
  },
  {
    icon: 'checkCircle',
    title: 'Acompanhe seu progresso',
    desc: 'Cada aula concluída avança sua barra de progresso. Veja o quanto falta para terminar cada trilha.',
    hint: 'Na sua dashboard você vê de relance todas as trilhas em andamento e as já concluídas.',
  },
  {
    icon: 'messageCircle',
    title: 'Tire suas dúvidas',
    desc: 'Dentro de cada aula você pode enviar dúvidas diretamente para o professor responsável pela trilha.',
    hint: 'O professor recebe sua dúvida no painel dele e responde por lá.',
  },
  {
    icon: 'barChart',
    title: 'Veja seu desempenho',
    desc: 'Na página de Desempenho você acompanha sua evolução: trilhas concluídas, aulas assistidas e sua frequência de estudos.',
    hint: 'Quanto mais consistente for sua rotina, mais rápido você avança.',
  },
]

// ─── OnboardingView ───────────────────────────────────────────────────────────
function OnboardingView({ firstName, onFinish }) {
  const [step, setStep] = useState(-1)
  const isWelcome = step === -1
  const current   = isWelcome ? null : OB_STEPS[step]
  const isLast    = step === OB_STEPS.length - 1
  const total     = OB_STEPS.length + 1
  const current0  = step + 1

  return (
    <div className={styles.obScreen}>
      <div className={styles.obLogo}>
        <svg width="140" height="22" viewBox="0 0 160 26" fill="none">
          <text x="0"  y="21" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF">Study</text>
          <text x="68" y="21" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="22" fill="#6C5CE7">Connect</text>
        </svg>
      </div>
      <div className={styles.obProgressBar}>
        <div className={styles.obProgressFill} style={{ width: `${(current0 / total) * 100}%` }} />
      </div>
      <div className={styles.obWrap}>
        <div className={styles.obCard} key={step}>
          <div className={styles.obCardIcon}>
            <Icon name={isWelcome ? 'sparkles' : current.icon} size={28} />
          </div>
          <div className={styles.obCardLabel}>
            {isWelcome ? 'Bem-vindo à plataforma' : `Passo ${step + 1} de ${OB_STEPS.length}`}
          </div>
          <h2 className={styles.obCardTitle}>
            {isWelcome ? <>Olá, <span className={styles.obCardAccent}>{firstName}</span> 👋</> : current.title}
          </h2>
          <p className={styles.obCardDesc}>
            {isWelcome
              ? 'Esta é uma plataforma de trilhas de estudo guiadas. Aqui você encontra conteúdo organizado por professores e estuda no seu próprio ritmo.'
              : current.desc}
          </p>
          <div className={styles.obCardHint}>
            <Icon name="sparkles" size={12} />
            <span>{isWelcome ? 'Leva menos de 2 minutos para se matricular na sua primeira trilha.' : current.hint}</span>
          </div>
          <div className={styles.obDots}>
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className={`${styles.obDot} ${i === current0 ? styles.obDotActive : i < current0 ? styles.obDotDone : ''}`} />
            ))}
          </div>
          <div className={styles.obNav} style={step === -1 ? { justifyContent: 'center' } : {}}>
            {step > -1 && (
              <button className={styles.obBtnBack} onClick={() => setStep(s => s - 1)}>← Voltar</button>
            )}
            {isWelcome ? (
              <button className={styles.obBtnNext} onClick={() => setStep(0)}>Começar →</button>
            ) : !isLast ? (
              <button className={styles.obBtnNext} onClick={() => setStep(s => s + 1)}>Próximo →</button>
            ) : (
              <button className={styles.obBtnCreate} onClick={onFinish}>
                <Icon name="compass" size={14} /> Explorar trilhas
              </button>
            )}
          </div>
        </div>
      </div>
      <p className={styles.obCounter}>{current0} de {total}</p>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Sk({ h, r = 12 }) {
  return <div className={styles.sk} style={{ height: h, borderRadius: r }} />
}

// ─── Tour steps ───────────────────────────────────────────────────────────────
const TOUR_STEPS = [
  {
    target: 'dash-destaque',
    title: 'Sua trilha em andamento',
    description: 'Aqui aparece a trilha que você está estudando no momento. Clique em "Continuar trilha" para retomar de onde parou.',
  },
  {
    target: 'dash-stats',
    title: 'Seu progresso',
    description: 'Veja quantas trilhas você está cursando, quantas já concluiu e quantas estão disponíveis para explorar.',
  },
  {
    target: 'dash-bottom',
    title: 'Meta e atividade',
    description: 'Acompanhe sua meta semanal de estudos e veja suas atividades recentes na plataforma.',
  },
]

// ─── DashboardPage ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { minhasTrilhas, todasTrilhas, loading, getProgresso } = useMinhasTrilhas()
  const { perfil, loading: loadingPerfil, savePerfil, metaSemanal } = usePerfilAprendizado()

  const concluidas  = minhasTrilhas.filter(t => getProgresso(t.id) === 100)
  const destaque    = minhasTrilhas.find(t => getProgresso(t.id) < 100) ?? minhasTrilhas[0]
  const destaquePct = destaque ? getProgresso(destaque.id) : 0

  const [duvidasRespondidas, setDuvidasRespondidas] = useState([])
  useEffect(() => {
    if (!user?.id) return
    api(`${ENDPOINTS.duvidas}?alunoId=${user.id}`)
      .then(data => setDuvidasRespondidas((data ?? []).filter(d => d.resposta).slice(0, 3)))
      .catch(() => {})
  }, [user?.id])

  // Onboarding de perfil: mostra se perfil ainda não existe (após carregar)
  const [showPerfilOnboarding, setShowPerfilOnboarding] = useState(false)
  useEffect(() => {
    if (!loadingPerfil && perfil === null && user?.role === 'student') {
      setShowPerfilOnboarding(true)
    }
  }, [loadingPerfil, perfil, user?.role])

  async function handlePerfilComplete(data) {
    await savePerfil(data)
    setShowPerfilOnboarding(false)
  }

  const [showOnboarding, setShowOnboarding] = useState(() =>
    user?.id ? !isObDone(user.id) : false
  )
  const [showWelcome,  setShowWelcome]  = useState(false)
  const [showTour,     setShowTour]     = useState(false)
  const [showLetsGo,   setShowLetsGo]   = useState(false)

  // Após onboarding, mostra card de boas-vindas à dashboard
  useEffect(() => {
    if (!user?.id || showOnboarding) return
    try {
      if (localStorage.getItem(tourKey(user.id)) !== 'true') {
        setTimeout(() => setShowWelcome(true), 600)
      }
    } catch {}
  }, [user?.id, showOnboarding])

  function handleObFinish() {
    markObDone(user?.id)
    setShowOnboarding(false)
  }

  const firstName = user?.name?.split(' ')[0] ?? 'Aluno'

  if (showOnboarding) {
    return <OnboardingView firstName={firstName} onFinish={handleObFinish} />
  }

  if (showPerfilOnboarding) {
    return <OnboardingPerfilPage firstName={firstName} onComplete={handlePerfilComplete} />
  }

  return (
    <DashboardLayout>
      <SpotlightTour
        steps={TOUR_STEPS}
        active={showTour}
        onFinish={() => { setShowTour(false); setShowLetsGo(true) }}
        storageKey={tourKey(user?.id)}
      />

      {showLetsGo && (
        <div className={styles.welcomeBackdrop}>
          <div className={styles.welcomeCard}>
            <div className={styles.welcomeIcon}><Icon name="compass" size={28} /></div>
            <h2 className={styles.welcomeTitle}>Vamos começar os estudos? 🚀</h2>
            <p className={styles.welcomeDesc}>
              Explore as trilhas disponíveis, escolha uma que te interessa e se matricule. É rápido!
            </p>
            <div className={styles.welcomeActions}>
              <button
                className={styles.welcomeBtnSecondary}
                onClick={() => setShowLetsGo(false)}
              >
                Agora não
              </button>
              <button
                className={styles.welcomeBtnPrimary}
                onClick={() => navigate(STUDENT_ROUTES.trilhas, { state: { startTour: true } })}
              >
                <Icon name="compass" size={14} /> Explorar trilhas
              </button>
            </div>
          </div>
        </div>
      )}

      {showWelcome && (
        <div className={styles.welcomeBackdrop}>
          <div className={styles.welcomeCard}>
            <div className={styles.welcomeIcon}><Icon name="home" size={28} /></div>
            <h2 className={styles.welcomeTitle}>Esta é sua dashboard</h2>
            <p className={styles.welcomeDesc}>
              Aqui você acompanha suas trilhas, progresso e atividades. Quer fazer um tour rápido?
            </p>
            <div className={styles.welcomeActions}>
              <button
                className={styles.welcomeBtnSecondary}
                onClick={() => {
                  setShowWelcome(false)
                  try { localStorage.setItem(tourKey(user?.id), 'true') } catch {}
                }}
              >
                Pular
              </button>
              <button
                className={styles.welcomeBtnPrimary}
                onClick={() => { setShowWelcome(false); setShowTour(true) }}
              >
                <Icon name="sparkles" size={14} /> Começar tour
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.page}>

        {/* ── 1. Card principal: Continuar trilha ── */}
        <div className={styles.destaqueCard} data-tour="dash-destaque">
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
        <div className={styles.statsRow} data-tour="dash-stats">
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

        {/* ── 3 + 4. Meta semanal + Dúvidas respondidas ── */}
        <div className={styles.bottomRow} data-tour="dash-bottom">

          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardLabel}>Meta semanal</span>
              <button className={styles.linkBtn} onClick={() => navigate(STUDENT_ROUTES.desempenho)}>
                Ver desempenho →
              </button>
            </div>
            {loading ? (
              <div className={styles.emptyCard}><Sk h={14} /></div>
            ) : minhasTrilhas.length === 0 ? (
              <div className={styles.emptyCard}>
                <Icon name="target" size={24} style={{ opacity: .18 }} />
                <p>Matricule-se em uma trilha para ver seu progresso.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {minhasTrilhas.slice(0, 3).map(t => {
                  const pct = getProgresso(t.id)
                  const barColor = pct >= 100
                    ? 'rgba(34,197,94,.7)'
                    : pct >= 70
                    ? 'rgba(74,222,128,.6)'
                    : pct >= 40
                    ? 'rgba(250,204,21,.55)'
                    : 'rgba(251,146,60,.5)'
                  return (
                    <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{t.nome}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                        <div className={styles.progressBar} style={{ width: `${pct}%`, background: barColor }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardLabel}>Dúvidas respondidas</span>
              <button className={styles.linkBtn} onClick={() => navigate(STUDENT_ROUTES.duvidas)}>
                Ver todas →
              </button>
            </div>
            {duvidasRespondidas.length === 0 ? (
              <div className={styles.emptyCard}>
                <Icon name="alertCircle" size={24} style={{ opacity: .18 }} />
                <p>Suas dúvidas respondidas aparecerão aqui.</p>
              </div>
            ) : (
              <div className={styles.actList}>
                {duvidasRespondidas.map(d => (
                  <div
                    key={d.id}
                    className={styles.actItem}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(STUDENT_ROUTES.duvidas)}
                  >
                    <span className={styles.actIcon} style={{ background: 'rgba(34,197,94,.1)', color: '#22c55e' }}>
                      <Icon name="checkCircle" size={15} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className={styles.actText} style={{ fontWeight: 600, color: 'var(--text)' }}>
                        {d.aulaTitulo}
                      </p>
                      <p className={styles.actText} style={{ fontSize: 12, marginTop: 2 }}>
                        {d.resposta?.slice(0, 60)}{d.resposta?.length > 60 ? '...' : ''}
                      </p>
                    </div>
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
