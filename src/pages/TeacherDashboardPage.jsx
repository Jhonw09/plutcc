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
import styles from './TeacherDashboardPage.module.css'

function Sk({ h = 80, r = 14 }) {
  return <div className={styles.sk} style={{ height: h, borderRadius: r }} />
}

export default function TeacherDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toasts, toast, dismiss } = useToast()
  const { trilhas, loading, error, createTrilha: createTrilhaHandler, deleteTrilha: deleteTrilhaHandler } = useTrilhas()

  const [resumo,       setResumo]       = useState(null)
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
      { icon: 'school',    label: 'Trilhas criadas',   value: loading ? '—' : trilhas.length,                       color: 'purple' },
      { icon: 'users',     label: 'Alunos matriculados', value: loadingResumo ? '—' : (resumo?.totalAlunos ?? 0),   color: 'blue'   },
      { icon: 'globe',     label: 'Trilhas públicas',  value: loading ? '—' : publicCount,                          color: 'green'  },
      { icon: 'lock',      label: 'Trilhas privadas',  value: loading ? '—' : trilhas.length - publicCount,         color: 'orange' },
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

        {/* ── Stats ── */}
        <div className={styles.statsGrid}>
          {stats.map((s, i) => (
            <div key={i} className={styles.statCard}>
              <span className={styles.statIconWrap} data-color={s.color}>
                <Icon name={s.icon} size={18} />
              </span>
              <div>
                <p className={styles.statValue}>{s.value}</p>
                <p className={styles.statLabel}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Trilha destaque (mais alunos) ── */}
        {!loadingResumo && resumo?.trilhaDestaque && (
          <div className={styles.destaqueCard}
            onClick={() => navigate(`/professor/trilha/${resumo.trilhaDestaque.id}`)}>
            <div className={styles.destaqueLeft}>
              <span className={styles.destaqueTag}>Trilha em destaque</span>
              <p className={styles.destaqueName}>{resumo.trilhaDestaque.nome}</p>
              <p className={styles.destaqueSub}>
                <Icon name="users" size={13} />
                {resumo.trilhaDestaque.alunos} aluno{resumo.trilhaDestaque.alunos !== 1 ? 's' : ''} matriculados
              </p>
            </div>
            <Icon name="chevronRight" size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          </div>
        )}

        {/* ── Minhas trilhas ── */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Minhas trilhas</h2>
            <button className={styles.btnNew} onClick={() => setClassModalOpen(true)}>
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
              <Icon name="school" size={32} style={{ opacity: .3 }} />
              <p>Nenhuma trilha criada ainda.</p>
              <button className={styles.btnNew} onClick={() => setClassModalOpen(true)}>
                Criar primeira trilha
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
