import { useState, useEffect, useMemo } from 'react'
import { useNavigate }      from 'react-router-dom'
import TeacherLayout        from '../components/teacher/TeacherLayout'
import TrilhaCard           from '../components/teacher/TrilhaCard'
import CreateTrilhaModal    from '../components/teacher/CreateTrilhaModal'
import { ConfirmModal }     from '../components/ui/ConfirmModal'
import { Toast }            from '../components/ui/Toast'
import Icon                 from '../components/ui/Icon'
import { useToast }         from '../hooks/useToast'
import { useAuth }          from '../context/AuthContext'
import { useTrilhas }       from '../hooks/useTrilhas'
import { getResumoProfessor } from '../api/services/matriculaService'
import { recentActivity, students } from '../data/teacherDashboard'
import { TEACHER_ROUTES } from '../constants/routes'
import styles from './TeacherDashboardPage.module.css'

function Sk({ h = 80, r = 14 }) {
  return <div className={styles.sk} style={{ height: h, borderRadius: r }} />
}

const WEEK_DAYS  = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const WEEK_DATA  = [45, 72, 30, 88, 60, 20, 0]

export default function TeacherDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toasts, toast, dismiss } = useToast()
  const { trilhas, loading, error, createTrilha: createTrilhaHandler, deleteTrilha: deleteTrilhaHandler } = useTrilhas()

  const [resumo,        setResumo]        = useState(null)
  const [loadingResumo, setLoadingResumo] = useState(true)
  const [classModalOpen, setClassModalOpen] = useState(false)
  const [editTarget,     setEditTarget]     = useState(null)
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const [deletingId,     setDeletingId]     = useState(null)

  useEffect(() => {
    if (!user?.id) return
    getResumoProfessor(user.id)
      .then(setResumo)
      .finally(() => setLoadingResumo(false))
  }, [user?.id])

  const stats = useMemo(() => {
    const publicCount = trilhas.filter(t => t.tipo === 'PUBLICA').length
    return [
      { icon: 'school',  label: 'Trilhas criadas',    value: loading ? '—' : trilhas.length,                     color: 'purple' },
      { icon: 'users',   label: 'Alunos matriculados', value: loadingResumo ? '—' : (resumo?.totalAlunos ?? 0),  color: 'blue'   },
      { icon: 'globe',   label: 'Trilhas públicas',   value: loading ? '—' : publicCount,                        color: 'green'  },
      { icon: 'lock',    label: 'Trilhas privadas',   value: loading ? '—' : trilhas.length - publicCount,       color: 'orange' },
    ]
  }, [trilhas, loading, resumo, loadingResumo])

  async function handleCreate(newClass) {
    try {
      const created = await createTrilhaHandler(newClass)
      toast(`Trilha "${created.nome}" criada!`, 'success')
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

  const maxBar    = Math.max(...WEEK_DATA, 1)
  const atRisk    = students.filter(s => s.status === 'at-risk')
  const firstName = user?.name?.split(' ')[0] ?? 'Professor'

  return (
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
      <Toast toasts={toasts} onDismiss={dismiss} />

      <div className={styles.page}>

        {/* ── Hero ── */}
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <span className={styles.heroTag}>Painel do Professor</span>
            <h1 className={styles.heroTitle}>Olá, {firstName} 👋</h1>
            <p className={styles.heroSub}>Gerencie suas trilhas, acompanhe seus alunos e monitore o desempenho da turma.</p>
            <div className={styles.heroActions}>
              <button className={styles.btnPrimary} onClick={() => setClassModalOpen(true)}>
                <Icon name="plus" size={15} /> Nova trilha
              </button>
              <button className={styles.btnSecondary} onClick={() => navigate(TEACHER_ROUTES.reports)}>
                <Icon name="barChart" size={15} /> Ver relatórios
              </button>
            </div>
          </div>
          <div className={styles.heroRight} aria-hidden>
            <Icon name="school" size={52} />
          </div>
        </div>

        {/* ── Stats ── */}
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

        {/* ── Middle row: atividade semanal + alunos em risco ── */}
        <div className={styles.midRow}>

          {/* Atividade semanal (mock) */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Engajamento semanal</span>
              <button className={styles.linkBtn} onClick={() => navigate(TEACHER_ROUTES.reports)}>
                Ver relatório →
              </button>
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
            <div className={styles.barStats}>
              <div className={styles.barStat}><span className={styles.barStatVal}>5</span><span className={styles.barStatLbl}>Dias ativos</span></div>
              <div className={styles.barStatDiv} />
              <div className={styles.barStat}><span className={styles.barStatVal}>88</span><span className={styles.barStatLbl}>Pico (min)</span></div>
              <div className={styles.barStatDiv} />
              <div className={styles.barStat}><span className={styles.barStatVal}>45</span><span className={styles.barStatLbl}>Média/dia</span></div>
            </div>
          </div>

          {/* Alunos em risco */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Alunos em risco</span>
              <button className={styles.linkBtn} onClick={() => navigate(TEACHER_ROUTES.students)}>
                Ver todos →
              </button>
            </div>
            <div className={styles.riskList}>
              {atRisk.map(s => (
                <div key={s.id} className={styles.riskItem}>
                  <div className={styles.riskAvatar}>{s.avatar}</div>
                  <div className={styles.riskInfo}>
                    <span className={styles.riskName}>{s.name}</span>
                    <span className={styles.riskClass}>{s.class}</span>
                  </div>
                  <div className={styles.riskPctWrap}>
                    <div className={styles.riskTrack}>
                      <div className={styles.riskFill} style={{ width: `${s.pct}%` }} />
                    </div>
                    <span className={styles.riskPct}>{s.pct}%</span>
                  </div>
                </div>
              ))}
              {atRisk.length === 0 && (
                <p className={styles.riskEmpty}>Nenhum aluno em risco no momento.</p>
              )}
            </div>
          </div>

        </div>

        {/* ── Bottom row: atividade recente + trilha destaque ── */}
        <div className={styles.bottomRow}>

          {/* Atividade recente */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Atividade recente</span>
            </div>
            <div className={styles.actList}>
              {recentActivity.slice(0, 5).map((item, i) => (
                <div key={i} className={styles.actItem}>
                  <span className={styles.actIcon} style={{ color: item.color }}>
                    <Icon name={item.icon} size={14} />
                  </span>
                  <div className={styles.actBody}>
                    <span className={styles.actStudent}>{item.student}</span>
                    <span className={styles.actAction}>{item.action}</span>
                  </div>
                  <span className={styles.actTime}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trilha destaque */}
          {!loadingResumo && resumo?.trilhaDestaque && (
            <div
              className={styles.destaqueCard}
              onClick={() => navigate(`/professor/trilha/${resumo.trilhaDestaque.id}`)}
            >
              <span className={styles.destaqueTag}>Trilha em destaque</span>
              <p className={styles.destaqueName}>{resumo.trilhaDestaque.nome}</p>
              <p className={styles.destaqueSub}>
                <Icon name="users" size={13} />
                {resumo.trilhaDestaque.alunos} aluno{resumo.trilhaDestaque.alunos !== 1 ? 's' : ''} matriculados
              </p>
              <span className={styles.destaqueArrow}>
                <Icon name="chevronRight" size={16} />
              </span>
            </div>
          )}

        </div>

        {/* ── Minhas trilhas ── */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Minhas trilhas</h2>
            <button className={styles.btnPrimary} onClick={() => setClassModalOpen(true)}>
              <Icon name="plus" size={14} /> Nova trilha
            </button>
          </div>

          {loading && (
            <div className={styles.skGrid}>
              {[0,1,2].map(i => <Sk key={i} h={90} />)}
            </div>
          )}

          {error && !loading && (
            <div className={styles.errorBanner}>
              <Icon name="alertCircle" size={15} /> {error}
            </div>
          )}

          {!loading && !error && trilhas.length === 0 && (
            <div className={styles.empty}>
              <Icon name="school" size={36} style={{ opacity: .25 }} />
              <p className={styles.emptyTitle}>Nenhuma trilha criada ainda</p>
              <p className={styles.emptySub}>Crie sua primeira trilha e comece a engajar seus alunos.</p>
              <button className={styles.btnPrimary} onClick={() => setClassModalOpen(true)}>
                <Icon name="plus" size={14} /> Criar primeira trilha
              </button>
            </div>
          )}

          {!loading && trilhas.length > 0 && (
            <div className={styles.trilhasList}>
              {trilhas.map(t => (
                <TrilhaCard
                  key={t.id}
                  {...t}
                  deleting={deletingId === t.id}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </TeacherLayout>
  )
}
