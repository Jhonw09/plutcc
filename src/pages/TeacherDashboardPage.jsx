import { useState, useEffect, useMemo } from 'react'
import { useNavigate }        from 'react-router-dom'
import TeacherLayout          from '../components/teacher/TeacherLayout'
import CreateTrilhaModal      from '../components/teacher/CreateTrilhaModal'
import { ConfirmModal }       from '../components/ui/ConfirmModal'
import { Toast }              from '../components/ui/Toast'
import SpotlightTour          from '../components/ui/SpotlightTour'
import Icon                   from '../components/ui/Icon'
import { useToast }           from '../hooks/useToast'
import { useAuth }            from '../context/AuthContext'
import { useTrilhas }         from '../hooks/useTrilhas'
import { getResumoProfessor } from '../api/services/matriculaService'
import { getDuvidasByTrilha } from '../api/services/duvidaService'
import { TEACHER_ROUTES }     from '../constants/routes'
import styles from './TeacherDashboardPage.module.css'

const AULA_TOUR_KEY      = 'plut_tour_aula_editor'
const dashTourKey  = (id) => `plut_tour_dashboard_${id}`

const DASHBOARD_TOUR_STEPS = [
  {
    target: 'dash-stats',
    title: 'Seus números em tempo real',
    description: 'Aqui você vê o total de trilhas criadas, alunos matriculados, aulas publicadas e trilhas públicas.',
  },
  {
    target: 'dash-desempenho',
    title: 'Desempenho das trilhas',
    description: 'Gráfico de atividade dos últimos 7 dias. Quando seus alunos estudarem, os dados aparecerão aqui.',
  },
  {
    target: 'dash-minhas-trilhas',
    title: 'Suas trilhas',
    description: 'Lista rápida das suas trilhas com número de alunos. Clique em "Gerenciar" para editar aulas.',
  },
  {
    target: 'dash-atualizacoes',
    title: 'Últimas atualizações',
    description: 'Registro das suas ações recentes: trilhas criadas, aulas publicadas e rascunhos pendentes.',
  },
  {
    target: 'dash-duvidas',
    title: 'Dúvidas não respondidas',
    description: 'Quando seus alunos enviarem dúvidas nas aulas, elas aparecerão aqui para você responder.',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function onboardingKey(userId) { return `plut_onboarding_done_${userId}` }
function isOnboardingDone(userId) {
  try { return localStorage.getItem(onboardingKey(userId)) === 'true' } catch { return false }
}
function markOnboardingDone(userId) {
  try { localStorage.setItem(onboardingKey(userId), 'true') } catch {}
}
function Sk() { return <div className={styles.sk} /> }

// ─── ONBOARDING VIEW ──────────────────────────────────────────────────────────
const STEPS = [
  {
    icon: 'school',
    title: 'O que é uma trilha?',
    desc: 'Uma trilha é um conjunto de aulas organizadas em torno de um tema de estudo. Você define o nome, a disciplina e o nível.',
    hint: 'Exemplo: "Matemática Básica", "Português para o ENEM", "Introdução à Programação"',
  },
  {
    icon: 'fileText',
    title: 'Adicione aulas',
    desc: 'Dentro de cada trilha você cria aulas. Cada aula pode ter blocos de conteúdo: explicações, links de vídeo e exercícios com alternativas.',
    hint: 'Você monta o conteúdo no próprio painel, sem precisar de ferramentas externas.',
  },
  {
    icon: 'users',
    title: 'Alunos se matriculam',
    desc: 'Após publicar, alunos encontram sua trilha, se matriculam e estudam no próprio ritmo.',
    hint: 'Trilhas públicas aparecem para todos os alunos. Trilhas privadas só para quem você indicar.',
  },
  {
    icon: 'barChart',
    title: 'Acompanhe pelo painel',
    desc: 'Na página de Relatórios você vê quantos alunos estão matriculados em cada trilha e quantas aulas foram publicadas.',
    hint: 'Simples e direto. Sem métricas escolares complexas.',
  },
]

function OnboardingView({ firstName, onCreateTrilha }) {
  const [step, setStep] = useState(-1)
  const isWelcome = step === -1
  const current   = isWelcome ? null : STEPS[step]
  const isLast    = step === STEPS.length - 1
  const total     = STEPS.length + 1
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
            {isWelcome ? 'Bem-vindo à plataforma' : `Passo ${step + 1} de ${STEPS.length}`}
          </div>
          <h2 className={styles.obCardTitle}>
            {isWelcome ? <>Olá, <span className={styles.obCardAccent}>{firstName}</span> 👋</> : current.title}
          </h2>
          <p className={styles.obCardDesc}>
            {isWelcome
              ? 'Esta é uma plataforma de trilhas de estudo guiadas. Aqui você cria conteúdo, organiza aulas e conecta alunos ao seu conhecimento.'
              : current.desc}
          </p>
          <div className={styles.obCardHint}>
            <Icon name="sparkles" size={12} />
            <span>{isWelcome ? 'Leva menos de 5 minutos para criar sua primeira trilha.' : current.hint}</span>
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
              <button className={styles.obBtnCreate} onClick={onCreateTrilha}>
                <Icon name="plus" size={14} /> Criar minha primeira trilha
              </button>
            )}
          </div>
        </div>
      </div>
      <p className={styles.obCounter}>{current0} de {total}</p>
    </div>
  )
}

// ─── DASHBOARD NORMAL ─────────────────────────────────────────────────────────
function DashboardView({ user, trilhas, loading, resumo, loadingResumo, duvidasPendentes, navigate, onOpenCreate }) {
  const firstName = user?.name?.split(' ')[0] ?? 'Professor'
  const top3      = resumo?.trilhas ?? []

  const stats = useMemo(() => [
    { icon: 'school',   color: 'purple', value: loading       ? '—' : trilhas.length,               label: 'Trilhas criadas',     delta: `${trilhas.length} no total`   },
    { icon: 'users',    color: 'blue',   value: loadingResumo ? '—' : (resumo?.totalAlunos  ?? 0),   label: 'Alunos matriculados', delta: 'em todas as trilhas'           },
    { icon: 'fileText', color: 'green',  value: loadingResumo ? '—' : (resumo?.totalAulas   ?? 0),   label: 'Aulas publicadas',    delta: 'conteúdo disponível'           },
    { icon: 'star',     color: 'orange', value: loadingResumo ? '—' : (resumo?.trilhasAtivas ?? 0),  label: 'Trilhas públicas',    delta: 'visíveis para alunos'          },
  ], [trilhas, loading, resumo, loadingResumo])

  return (
    <div className={styles.page}>

      <div className={styles.greeting}>
        <h1 className={styles.greetingTitle}>
          Olá, <span className={styles.greetingName}>{firstName}</span> 👋
        </h1>
        <p className={styles.greetingSub}>Aqui está o resumo da sua atividade.</p>
      </div>

      <div className={styles.statsGrid} data-tour="dash-stats">
        {stats.map((s, i) => (
          <div key={i} className={styles.statCard}>
            <span className={styles.statIconWrap} data-color={s.color}>
              <Icon name={s.icon} size={20} />
            </span>
            <div className={styles.statBody}>
              <p className={styles.statValue}>{s.value}</p>
              <p className={styles.statLabel}>{s.label}</p>
              <p className={styles.statDelta}>{s.delta}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Linha 1 */}
      <div className={styles.row}>

        {/* Desempenho */}
        <div className={styles.card} data-tour="dash-desempenho">
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Desempenho das trilhas</span>
            <span className={styles.cardBadge}>Taxa de conclusão</span>
          </div>
          {loadingResumo ? (
            <div className={styles.skList}>{[0,1,2].map(i => <Sk key={i} />)}</div>
          ) : top3.length === 0 ? (
            <div className={styles.emptyChart}>
              <Icon name="barChart" size={28} style={{ opacity: .18 }} />
              <p>Quando seus alunos começarem a estudar, o desempenho aparecerá aqui.</p>
            </div>
          ) : (
            <div className={styles.studentList}>
              {top3.map((t, i) => {
                const pct = Number(t.taxaConclusao ?? 0)
                return (
                  <div key={i} className={styles.studentRow}>
                    <div className={styles.trilhaThumb}><Icon name="school" size={14} /></div>
                    <div className={styles.studentInfo}>
                      <span className={styles.studentName}>{t.nome}</span>
                      <span className={styles.studentSub}>
                        <Icon name="users" size={10} /> {t.alunos} aluno{t.alunos !== 1 ? 's' : ''}
                        {' · '}{t.aulas} aula{t.aulas !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className={styles.studentRight}>
                      <span className={styles.studentPct}>{pct}%</span>
                      <div className={styles.studentTrack}>
                        <div className={styles.studentFill} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className={styles.barLegend}>
            <span className={styles.legendDot} />
            <span className={styles.legendText}>% de aulas concluídas pelos alunos</span>
          </div>
        </div>

        {/* Minhas trilhas */}
        <div className={styles.card} data-tour="dash-minhas-trilhas">
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Minhas trilhas</span>
            <button className={styles.cardLink} onClick={() => navigate(TEACHER_ROUTES.trilhas)}>
              Ver todas →
            </button>
          </div>
          {loading ? (
            <div className={styles.skList}>{[0,1,2].map(i => <Sk key={i} />)}</div>
          ) : trilhas.length === 0 ? (
            <div className={styles.emptySmall}>
              <p>Nenhuma trilha ainda.</p>
              <button className={styles.btnPrimary} onClick={onOpenCreate}>
                <Icon name="plus" size={13} /> Criar trilha
              </button>
            </div>
          ) : (
            <div className={styles.trilhasList}>
              {trilhas.slice(0, 3).map(t => {
                const info   = top3.find(r => Number(r.id) === t.id)
                const alunos = info?.alunos ?? 0
                return (
                  <div key={t.id} className={styles.trilhaRow}>
                    <div className={styles.trilhaThumb}><Icon name="school" size={15} /></div>
                    <div className={styles.trilhaInfo}>
                      <span className={styles.trilhaNome}>{t.nome}</span>
                      <span className={styles.trilhaMeta}><Icon name="users" size={10} /> {alunos} aluno{alunos !== 1 ? 's' : ''}</span>
                    </div>
                    <button className={styles.trilhaBtn} onClick={() => navigate(`/professor/trilha/${t.id}`, { state: t })}>
                      Gerenciar <Icon name="chevronRight" size={11} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* Linha 2 */}
      <div className={styles.row}>

        {/* Últimas atualizações */}
        <div className={styles.card} data-tour="dash-atualizacoes">
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Últimas atualizações</span>
          </div>
          {(() => {
            const eventos = []
            if (!loading && trilhas.length > 0) {
              const ultima = trilhas[0]
              eventos.push({ icon: 'school',   color: '#a78bfa', bg: 'rgba(108,92,231,.12)', text: <>Trilha <strong>{ultima.nome}</strong> criada</> })
            }
            if (!loadingResumo && (resumo?.totalAulas ?? 0) > 0) {
              eventos.push({ icon: 'fileText', color: '#4ade80', bg: 'rgba(34,197,94,.12)',  text: <><strong>{resumo.totalAulas}</strong> aula{resumo.totalAulas !== 1 ? 's' : ''} publicada{resumo.totalAulas !== 1 ? 's' : ''} no total</> })
            }
            if (!loadingResumo && (resumo?.totalRascunhos ?? 0) > 0) {
              eventos.push({ icon: 'pencil',   color: '#fbbf24', bg: 'rgba(234,179,8,.12)',  text: <><strong>{resumo.totalRascunhos}</strong> rascunho{resumo.totalRascunhos !== 1 ? 's' : ''} pendente{resumo.totalRascunhos !== 1 ? 's' : ''}</> })
            }
            if (!loading && trilhas.length > 1) {
              eventos.push({ icon: 'school',   color: '#a78bfa', bg: 'rgba(108,92,231,.12)', text: <><strong>{trilhas.length}</strong> trilhas criadas no total</> })
            }
            if (eventos.length === 0) {
              return (
                <div className={styles.emptyChart}>
                  <Icon name="clock" size={24} style={{ opacity: .18 }} />
                  <p>Suas ações recentes aparecerão aqui conforme você usar a plataforma.</p>
                </div>
              )
            }
            return (
              <div className={styles.actList}>
                {eventos.map((e, i) => (
                  <div key={i} className={styles.actItem}>
                    <span className={styles.actIcon} style={{ background: e.bg, color: e.color }}>
                      <Icon name={e.icon} size={15} />
                    </span>
                    <span className={styles.actText}>{e.text}</span>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>

        {/* Dúvidas não respondidas */}
        <div className={styles.card} data-tour="dash-duvidas">
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Dúvidas não respondidas</span>
          </div>
          {duvidasPendentes.length === 0 ? (
            <div className={styles.emptyChart}>
              <Icon name="alertCircle" size={24} style={{ opacity: .18 }} />
              <p>Quando seus alunos enviarem dúvidas nas aulas, elas aparecerão aqui para você responder.</p>
            </div>
          ) : (
            <div className={styles.actList}>
              {duvidasPendentes.slice(0, 4).map((d, i) => (
                <div key={i} className={styles.actItem}>
                  <span className={styles.actIcon} style={{ background: 'rgba(234,179,8,.12)', color: '#fbbf24' }}>
                    <Icon name="alertCircle" size={15} />
                  </span>
                  <span className={styles.actText}>
                    <strong>{d.alunoNome}</strong> — <em>{d.aulaTitulo}</em>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function TeacherDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toasts, toast, dismiss } = useToast()
  const { trilhas, loading, createTrilha: createTrilhaHandler, deleteTrilha: deleteTrilhaHandler } = useTrilhas()

  const [resumo,         setResumo]         = useState(null)
  const [loadingResumo,  setLoadingResumo]  = useState(true)
  const [duvidasPendentes, setDuvidasPendentes] = useState([])
  const [classModalOpen, setClassModalOpen] = useState(false)
  const [editTarget,     setEditTarget]     = useState(null)
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const [deletingId,     setDeletingId]     = useState(null)

  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (!user?.id) return false
    return !isOnboardingDone(user.id)
  })

  const [showDashTour,    setShowDashTour]    = useState(false)
  const [showDashWelcome, setShowDashWelcome] = useState(false)

  useEffect(() => {
    if (!user?.id || showOnboarding) return
    try {
      const aulaDone = localStorage.getItem(AULA_TOUR_KEY) === 'true'
      const dashDone = localStorage.getItem(dashTourKey(user.id)) === 'true'
      if (aulaDone && !dashDone) {
        // pequeno delay para o professor ver a página antes do card aparecer
        setTimeout(() => setShowDashWelcome(true), 600)
      }
    } catch {}
  }, [user?.id, showOnboarding])

  useEffect(() => {
    if (!user?.id) return
    getResumoProfessor(user.id)
      .then(data => {
        setResumo(data)
        // fetch pending duvidas for all trilhas
        if (data?.trilhas?.length) {
          Promise.all(data.trilhas.map(t => getDuvidasByTrilha(t.id)))
            .then(results => {
              const pending = results.flat().filter(d => d.status === 'PENDENTE')
              setDuvidasPendentes(pending)
            })
        }
      })
      .finally(() => setLoadingResumo(false))
  }, [user?.id])

  useEffect(() => {
    if (!loading && trilhas.length > 0 && showOnboarding) {
      markOnboardingDone(user?.id)
      setShowOnboarding(false)
    }
  }, [loading, trilhas.length]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(newClass) {
    try {
      const created = await createTrilhaHandler(newClass)
      toast(`Trilha "${created.nome}" criada!`, 'success')
      markOnboardingDone(user?.id)
      setShowOnboarding(false)
      navigate(`/professor/trilha/${created.id}`, { state: created })
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao criar trilha', 'error')
      throw err
    }
  }

  function handleEdit(updated) {
    toast(`Trilha "${updated.nome}" atualizada.`, 'success')
    setEditTarget(null)
  }

  async function handleDeleteConfirm() {
    const { id, nome } = deleteTarget
    setDeletingId(id)
    setDeleteTarget(null)
    try {
      await deleteTrilhaHandler(id)
      toast(`Trilha "${nome}" excluída.`, 'success')
    } catch (err) {
      toast(err.message || 'Erro ao excluir trilha.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  function closeModal() { setClassModalOpen(false); setEditTarget(null) }

  const firstName = user?.name?.split(' ')[0] ?? 'Professor'

  return (
    <>
      <Toast toasts={toasts} onDismiss={dismiss} />

      {showOnboarding ? (
        <>
          {classModalOpen && (
            <CreateTrilhaModal
              onClose={closeModal}
              onCreate={handleCreate}
              onEdit={handleEdit}
              initialData={editTarget}
              forceTour
            />
          )}
          <OnboardingView
            firstName={firstName}
            onCreateTrilha={() => { setEditTarget(null); setClassModalOpen(true) }}
          />
        </>
      ) : (
        <TeacherLayout>
          {classModalOpen && (
            <CreateTrilhaModal
              onClose={closeModal}
              onCreate={handleCreate}
              onEdit={handleEdit}
              initialData={editTarget}
            />
          )}
          {deleteTarget && (
            <ConfirmModal
              title="Excluir trilha"
              message={`Tem certeza que deseja excluir "${deleteTarget.nome}"? Esta ação não pode ser desfeita.`}
              confirmLabel="Excluir trilha"
              onConfirm={handleDeleteConfirm}
              onCancel={() => setDeleteTarget(null)}
            />
          )}
          <SpotlightTour
            steps={DASHBOARD_TOUR_STEPS}
            active={showDashTour}
            onFinish={() => setShowDashTour(false)}
            storageKey={dashTourKey(user?.id)}
          />

          {/* Card de boas-vindas à dashboard */}
          {showDashWelcome && (
            <div className={styles.dashWelcomeBackdrop}>
              <div className={styles.dashWelcomeCard}>
                <div className={styles.dashWelcomeIcon}>
                  <Icon name="home" size={28} />
                </div>
                <h2 className={styles.dashWelcomeTitle}>Esta é sua dashboard</h2>
                <p className={styles.dashWelcomeDesc}>
                  Aqui você acompanha tudo: suas trilhas, alunos matriculados, aulas publicadas e a atividade recente. Vamos fazer um tour rápido?
                </p>
                <div className={styles.dashWelcomeActions}>
                  <button
                    className={styles.dashWelcomeBtnSecondary}
                    onClick={() => {
                      setShowDashWelcome(false)
                      try { localStorage.setItem(dashTourKey(user?.id), 'true') } catch {}
                    }}
                  >
                    Pular
                  </button>
                  <button
                    className={styles.dashWelcomeBtnPrimary}
                    onClick={() => { setShowDashWelcome(false); setShowDashTour(true) }}
                  >
                    <Icon name="sparkles" size={14} /> Começar tour
                  </button>
                </div>
              </div>
            </div>
          )}
          <DashboardView
            user={user}
            trilhas={trilhas}
            loading={loading}
            resumo={resumo}
            loadingResumo={loadingResumo}
            duvidasPendentes={duvidasPendentes}
            navigate={navigate}
            onOpenCreate={() => { setEditTarget(null); setClassModalOpen(true) }}
          />
        </TeacherLayout>
      )}
    </>
  )
}
