import { useState, useMemo } from 'react'
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
import styles from './TeacherDashboardPage.module.css'

const SUBJECT_FILTERS = [
  'Todas', 'Matemática', 'Português', 'Química', 'Biologia',
  'Física', 'Geografia', 'História', 'Inglês',
  'Artes', 'Informática', 'Filosofia', 'Sociologia',
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'name',   label: 'Nome (A–Z)'    },
]

function buildStats(trilhas) {
  const publicCount = trilhas.filter(t => t.tipo === 'PUBLICA').length
  return [
    { id: 'classes',  icon: 'school', label: 'Trilhas ativas',   value: trilhas.length },
    { id: 'students', icon: 'users',  label: 'Total de alunos',  value: 'N/A'          },
    { id: 'public',   icon: 'globe',  label: 'Trilhas públicas', value: publicCount    },
    { id: 'private',  icon: 'lock',   label: 'Trilhas privadas', value: trilhas.length - publicCount },
  ]
}

export default function TeacherDashboardPage() {
  const navigate = useNavigate()
  const { toasts, toast, dismiss } = useToast()

  // trilhas vem direto do hook — sem estado intermediário (evita flicker)
  const { trilhas, loading, error, createTrilha: createTrilhaHandler, deleteTrilha: deleteTrilhaHandler } = useTrilhas()

  const [classModalOpen, setClassModalOpen] = useState(false)
  const [editTarget,     setEditTarget]     = useState(null)
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const [deletingId,     setDeletingId]     = useState(null) // id da trilha sendo deletada

  const [search,     setSearch]     = useState('')
  const [filterSubj, setFilterSubj] = useState('Todas')
  const [sortBy,     setSortBy]     = useState('recent')

  const visibleTrilhas = useMemo(() => {
    let list = [...trilhas]
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(t =>
        t.nome.toLowerCase().includes(q) ||
        (t.descricao && t.descricao.toLowerCase().includes(q))
      )
    }
    if (filterSubj !== 'Todas') list = list.filter(t => t.disciplina === filterSubj)
    if (sortBy === 'name')   list.sort((a, b) => a.nome.localeCompare(b.nome))
    if (sortBy === 'recent') list.sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm))
    return list
  }, [trilhas, search, filterSubj, sortBy])

  const stats      = useMemo(() => buildStats(trilhas), [trilhas])
  const isFiltered = search.trim() || filterSubj !== 'Todas'

  async function handleCreate(newClass) {
    try {
      const created = await createTrilhaHandler(newClass)
      toast(`Trilha "${created.nome}" criada com sucesso!`, 'success')
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

  function openEdit(t)        { setEditTarget(t); setClassModalOpen(true) }
  function openDelete(id, nome) { setDeleteTarget({ id, nome }) }
  function closeModal()       { setClassModalOpen(false); setEditTarget(null) }

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

      {/* LOADING — fetch ainda em andamento */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}><Icon name="clock" size={32} /></div>
          <p>Carregando trilhas...</p>
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <div className={styles.error}>
          <span className={styles.errorIcon}><Icon name="warning" size={40} /></span>
          <h3>Erro ao carregar trilhas</h3>
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        </div>
      )}

      {/* EMPTY — só exibe após fetch concluir e lista continuar vazia */}
      {!loading && !error && trilhas.length === 0 && (
        <div className={styles.heroEmpty}>
          <span className={styles.heroEmptyIcon}><Icon name="school" size={48} /></span>
          <h3 className={styles.heroEmptyTitle}>Está na hora de criar sua primeira trilha</h3>
          <p className={styles.heroEmptyDesc}>
            Organize seu conteúdo em uma trilha para seus alunos começarem a aprender.
          </p>
          <button className={styles.heroEmptyBtn} onClick={() => setClassModalOpen(true)}>
            Criar trilha
          </button>
        </div>
      )}

      {/* HAS TRILHAS */}
      {!loading && !error && trilhas.length > 0 && (
        <>
          <div className={styles.statsGrid}>
            {stats.map(s => (
              <div key={s.id} className={styles.statCard}>
                <span className={styles.statIcon}><Icon name={s.icon} size={20} /></span>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          <section className={styles.section}>
            <div className={styles.classesHeader}>
              <div className={styles.classesHeaderTop}>
                <h3 className={styles.sectionTitle}>Minhas trilhas</h3>
                <button className={styles.newClassBtn} onClick={() => setClassModalOpen(true)}>
                  + Nova trilha
                </button>
              </div>

              <div className={styles.controls}>
                <div className={styles.searchWrap}>
                  <span className={styles.searchIcon}><Icon name="search" size={15} /></span>
                  <input
                    className={styles.searchInput}
                    placeholder="Buscar por nome ou descrição…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className={styles.searchClear} onClick={() => setSearch('')} aria-label="Limpar busca">✕</button>
                  )}
                </div>

                <select className={styles.filterSelect} value={filterSubj} onChange={e => setFilterSubj(e.target.value)}>
                  {SUBJECT_FILTERS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select className={styles.filterSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {isFiltered && (
              <p className={styles.resultsCount}>
                {visibleTrilhas.length === 0
                  ? 'Nenhuma trilha encontrada.'
                  : `${visibleTrilhas.length} trilha${visibleTrilhas.length !== 1 ? 's' : ''} encontrada${visibleTrilhas.length !== 1 ? 's' : ''}.`}
              </p>
            )}

            {visibleTrilhas.length > 0 ? (
              <div className={styles.classesList}>
                {visibleTrilhas.map(t => (
                  <TrilhaCard
                    key={t.id}
                    {...t}
                    deleting={deletingId === t.id}
                    onEdit={openEdit}
                    onDelete={openDelete}
                  />
                ))}
              </div>
            ) : isFiltered ? (
              <div className={styles.emptyFilter}>
                <span className={styles.emptyFilterIcon}><Icon name="search" size={36} /></span>
                <p className={styles.emptyFilterText}>
                  Nenhuma trilha corresponde à sua busca.{' '}
                  <button className={styles.clearFiltersBtn} onClick={() => { setSearch(''); setFilterSubj('Todas') }}>
                    Limpar filtros
                  </button>
                </p>
              </div>
            ) : null}
          </section>
        </>
      )}

    </TeacherLayout>
  )
}
