import { useState, useEffect, useMemo } from 'react'
import { useNavigate }        from 'react-router-dom'
import TeacherLayout          from '../components/teacher/TeacherLayout'
import CreateTrilhaModal      from '../components/teacher/CreateTrilhaModal'
import { ConfirmModal }       from '../components/ui/ConfirmModal'
import { Toast }              from '../components/ui/Toast'
import Icon                   from '../components/ui/Icon'
import { useToast }           from '../hooks/useToast'
import { useAuth }            from '../context/AuthContext'
import { useTrilhas }         from '../hooks/useTrilhas'
import { getResumoProfessor } from '../api/services/matriculaService'
import { TEACHER_ROUTES }     from '../constants/routes'
import styles from './TeacherDashboardPage.module.css'

// ─── Dados mock para a dashboard normal ───────────────────────────────────────
const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const WEEK_DATA = [35, 72, 50, 88, 65, 45, 20]

const RECENT_ACTIVITY = [
  { color: '#4ade80', text: 'Ana Souza',      action: 'concluiu "Funções Quadráticas — Parte 2"', time: 'há 15min' },
  { color: '#93c5fd', text: 'Bruno Lima',     action: 'comentou em "Equações do 1º Grau"',        time: 'há 1h'    },
  { color: '#fbbf24', text: 'Carla Mendes',   action: 'atingiu 100% na trilha de Português',      time: 'há 3h'    },
  { color: '#4ade80', text: 'Diego Ferreira', action: 'concluiu "Introdução à Álgebra"',          time: 'ontem'    },
]

const TOP_STUDENTS = [
  { name: 'Diego Ferreira', avatar: 'D', aulas: 28, pct: 85 },
  { name: 'Felipe Rocha',   avatar: 'F', aulas: 17, pct: 62 },
  { name: 'Ana Souza',      avatar: 'A', aulas: 14, pct: 51 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function onboardingKey(userId) { return `plut_onboarding_done_${userId}` }

function isOnboardingDone(userId) {
  try { return localStorage.getItem(onboardingKey(userId)) === 'true' } catch { return false }
}

function markOnboardingDone(userId) {
  try { localStorage.setItem(onboardingKey(userId), 'true') } catch {}
}

function Sk() {
  return <div className={styles.sk} />
}

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

  // step -1 = boas-vindas, 0..3 = tutorial
  const isWelcome = step === -1
  const current   = isWelcome ? null : STEPS[step]
  const isLast    = step === STEPS.length - 1
  const total     = STEPS.length + 1 // welcome + 4 steps
  const current0  = step + 1         // 0-based index for progress

  return (
    <div className={styles.obScreen}>

      {/* Logo */}
      <div className={styles.obLogo}>
        <svg width="140" height="22" viewBox="0 0 160 26" fill="none">
          <text x="0"  y="21" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF">Study</text>
          <text x="68" y="21" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="22" fill="#6C5CE7">Connect</text>
        </svg>
      </div>

      {/* Progress bar */}
      <div className={styles.obProgressBar}>
        <div
          className={styles.obProgressFill}
          style={{ width: `${(current0 / total) * 100}%` }}
        />
      </div>

      {/* Card central */}
      <div className={styles.obWrap}>
        <div className={styles.obCard} key={step}>

          <div className={styles.obCardIcon}>
            <Icon name={isWelcome ? 'sparkles' : current.icon} size={28} />
          </div>

          <div className={styles.obCardLabel}>
            {isWelcome ? 'Bem-vindo à plataforma' : `Passo ${step + 1} de ${STEPS.length}`}
          </div>

          <h2 className={styles.obCardTitle}>
            {isWelcome
              ? <>Olá, <span className={styles.obCardAccent}>{firstName}</span> 👋</>
              : current.title}
          </h2>

          <p className={styles.obCardDesc}>
            {isWelcome
              ? 'Esta é uma plataforma de trilhas de estudo guiadas. Aqui você cria conteúdo, organiza aulas e conecta alunos ao seu conhecimento.'
              : current.desc}
          </p>

          <div className={styles.obCardHint}>
            <Icon name="sparkles" size={12} />
            <span>
              {isWelcome
                ? 'Leva menos de 5 minutos para criar sua primeira trilha.'
                : current.hint}
            </span>
          </div>

          {/* Dots dentro do card */}
          <div className={styles.obDots}>
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={`${styles.obDot} ${i === current0 ? styles.obDotActive : i < current0 ? styles.obDotDone : ''}`}
              />
            ))}
          </div>

          {/* Nav dentro do card */}
          <div className={styles.obNav} style={step === -1 ? { justifyContent: 'center' } : {}}>
            {step > -1 && (
              <button className={styles.obBtnBack} onClick={() => setStep(s => s - 1)}>
                ← Voltar
              </button>
            )}

            {isWelcome ? (
              <button className={styles.obBtnNext} onClick={() => setStep(0)}>
                Começar →
              </button>
            ) : !isLast ? (
              <button className={styles.obBtnNext} onClick={() => setStep(s => s + 1)}>
                Próximo →
              </button>
            ) : (
              <button className={styles.obBtnCreate} onClick={onCreateTrilha}>
                <Icon name="plus" size={14} /> Criar minha primeira trilha
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Step counter */}
      <p className={styles.obCounter}>
        {current0} de {total}
      </p>

    </div>
  )
}

// ─── DASHBOARD NORMAL ─────────────────────────────────────────────────────────
function DashboardView({ user, trilhas, loading, resumo, loadingResumo, navigate, onOpenCreate }) {
  const firstName = user?.name?.split(' ')[0] ?? 'Professor'
  const maxBar    = Math.max(...WEEK_DATA, 1)

  const stats = useMemo(() => [
    { icon: 'school',   color: 'purple', value: loading       ? '—' : trilhas.length,             label: 'Trilhas criadas',     delta: `${trilhas.length} no total`,      deltaUp: null  },
    { icon: 'users',    color: 'blue',   value: loadingResumo ? '—' : (resumo?.totalAlunos ?? 0), label: 'Alunos matriculados',  delta: 'em todas as trilhas',             deltaUp: null  },
    { icon: 'fileText', color: 'green',  value: loadingResumo ? '—' : (resumo?.totalAulas  ?? 0), label: 'Aulas publicadas',    delta: 'conteúdo disponível',             deltaUp: null  },
    { icon: 'star',     color: 'orange', value: '4.8',                                             label: 'Avaliação média',     delta: 'Baseado em avaliações',           deltaUp: null  },
  ], [trilhas, loading, resumo, loadingResumo])

  return (
    <div className={styles.page}>

      {/* Greeting */}
      <div className={styles.greeting}>
        <h1 className={styles.greetingTitle}>
          Olá, <span className={styles.greetingName}>{firstName}</span> 👋
        </h1>
        <p className={styles.greetingSub}>Aqui está o resumo da sua atividade.</p>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
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
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Desempenho das trilhas</span>
            <span className={styles.cardBadge}>Últimos 7 dias</span>
          </div>
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
          <div className={styles.barLegend}>
            <span className={styles.legendDot} />
            <span className={styles.legendText}>Alunos ativos</span>
          </div>
        </div>

        {/* Minhas trilhas */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Minhas trilhas</span>
            <button className={styles.cardLink} onClick={() => navigate(TEACHER_ROUTES.trilhas)}>
              Ver todas →
            </button>
          </div>
          {loading ? (
            <div className={styles.skList}>{[0,1,2].map(i => <Sk key={i} />)}</div>
          ) : (
            <div className={styles.trilhasList}>
              {trilhas.slice(0, 3).map(t => {
                const alunos = resumo?.trilhas?.find(r => r.id === t.id)?.totalAlunos ?? 0
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
              {trilhas.length === 0 && (
                <div className={styles.emptySmall}>
                  <p>Nenhuma trilha ainda.</p>
                  <button className={styles.btnPrimary} onClick={onOpenCreate}>
                    <Icon name="plus" size={13} /> Criar trilha
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Linha 2 */}
      <div className={styles.row}>

        {/* Atividade recente */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Atividade recente</span>
            <button className={styles.cardLink} onClick={() => navigate(TEACHER_ROUTES.reports)}>Ver tudo →</button>
          </div>
          <div className={styles.actList}>
            {RECENT_ACTIVITY.slice(0, 3).map((item, i) => (
              <div key={i} className={styles.actItem}>
                <span className={styles.actDot} style={{ background: item.color }} />
                <p className={styles.actText}><strong>{item.text}</strong> {item.action}</p>
                <span className={styles.actTime}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alunos mais ativos */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Alunos mais ativos</span>
          </div>
          <div className={styles.studentList}>
            {TOP_STUDENTS.map((s, i) => (
              <div key={i} className={styles.studentRow}>
                <div className={styles.studentAvatar}>{s.avatar}</div>
                <div className={styles.studentInfo}>
                  <span className={styles.studentName}>{s.name}</span>
                  <span className={styles.studentSub}>{s.aulas} aulas concluídas</span>
                </div>
                <div className={styles.studentRight}>
                  <span className={styles.studentPct}>{s.pct}%</span>
                  <div className={styles.studentTrack}>
                    <div className={styles.studentFill} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
  const { trilhas, loading, error, createTrilha: createTrilhaHandler, deleteTrilha: deleteTrilhaHandler } = useTrilhas()

  const [resumo,         setResumo]         = useState(null)
  const [loadingResumo,  setLoadingResumo]  = useState(true)
  const [classModalOpen, setClassModalOpen] = useState(false)
  const [editTarget,     setEditTarget]     = useState(null)
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const [deletingId,     setDeletingId]     = useState(null)

  // Onboarding: mostra até o professor concluir OU ter trilhas
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (!user?.id) return false
    return !isOnboardingDone(user.id)
  })

  useEffect(() => {
    if (!user?.id) return
    getResumoProfessor(user.id)
      .then(setResumo)
      .finally(() => setLoadingResumo(false))
  }, [user?.id])

  // Se o professor criar uma trilha, onboarding é concluído automaticamente
  useEffect(() => {
    if (!loading && trilhas.length > 0 && showOnboarding) {
      markOnboardingDone(user?.id)
      setShowOnboarding(false)
    }
  }, [loading, trilhas.length]) // eslint-disable-line react-hooks/exhaustive-deps

  function finishOnboarding() {
    markOnboardingDone(user?.id)
    setShowOnboarding(false)
  }

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

  function openEdit(t)          { setEditTarget(t); setClassModalOpen(true) }
  function openDelete(id, nome) { setDeleteTarget({ id, nome }) }
  function closeModal()         { setClassModalOpen(false); setEditTarget(null) }

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
          <DashboardView
            user={user}
            trilhas={trilhas}
            loading={loading}
            resumo={resumo}
            loadingResumo={loadingResumo}
            navigate={navigate}
            onOpenCreate={() => { setEditTarget(null); setClassModalOpen(true) }}
          />
        </TeacherLayout>
      )}
    </>
  )
}
