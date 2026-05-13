import { useState, useEffect, useMemo } from 'react'
import { useNavigate }      from 'react-router-dom'
import TeacherLayout       from '../components/teacher/TeacherLayout'
import TrilhaCard         from '../components/teacher/TrilhaCard'
import CreateTrilhaModal   from '../components/teacher/CreateTrilhaModal'
import { ConfirmModal }    from '../components/ui/ConfirmModal'
import { Toast }           from '../components/ui/Toast'
import Icon                from '../components/ui/Icon'
import { useToast }        from '../hooks/useToast'
import { useAuth }         from '../context/AuthContext'
import { useTrilhas }      from '../hooks/useTrilhas'
import styles from './TeacherDashboardPage.module.css'

// ── Filter options ────────────────────────────────────────────────────────────
const SUBJECT_FILTERS = [
  'Todas', 'Matemática', 'Português', 'Química', 'Biologia',
  'Física', 'Geografia', 'História', 'Inglês',
  'Artes', 'Informática', 'Filosofia', 'Sociologia',
]

const SORT_OPTIONS = [
  { value: 'recent',   label: 'Mais recentes' },
  { value: 'name',     label: 'Nome (A–Z)'    },
  { value: 'students', label: 'Mais alunos'   },
]

// ── Derived stats from API class list ───────────────────────────────────────
function buildStats(classes) {
  const publicCount = classes.filter(c => c.tipo === 'PUBLICA').length
  return [
    { id: 'classes',  icon: 'school',  label: 'Trilhas ativas',   value: classes.length,  delta: null },
    { id: 'students', icon: 'users',   label: 'Total de alunos', value: 'N/A',            delta: null },
    { id: 'public',   icon: 'globe',   label: 'Trilhas públicas', value: publicCount,      delta: null },
    { id: 'private',  icon: 'lock',    label: 'Trilhas privadas', value: classes.length - publicCount, delta: null },
  ]
}

export default function TeacherDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toasts, toast, dismiss } = useToast()
  const { trilhas, loading, error, createTrilha: createTrilhaHandler, deleteTrilha: deleteTrilhaHandler, refreshTrilhas } = useTrilhas()

  // ── Class state ──────────────────────────────────────────────────────────────
  const [classes, setClasses] = useState([])

  // ── Modal state ──────────────────────────────────────────────────────────────
  const [classModalOpen,    setClassModalOpen]    = useState(false)
  const [editTarget,        setEditTarget]        = useState(null)   // class object | null
  const [deleteTarget,      setDeleteTarget]      = useState(null)   // { id, nome } | null

  // ── Search & filter state ────────────────────────────────────────────────────
  const [search,     setSearch]     = useState('')
  const [filterSubj, setFilterSubj] = useState('Todas')
  const [sortBy,     setSortBy]     = useState('recent')

  // Sync trilhas from hook to local state for filtering
  useEffect(() => {
    setClasses(trilhas)
  }, [trilhas])

  // ── Derived: filtered + sorted classes ───────────────────────────────────────
  const visibleClasses = useMemo(() => {
    let list = [...classes]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(c =>
        c.nome.toLowerCase().includes(q) ||
        (c.descricao && c.descricao.toLowerCase().includes(q))
      )
    }

    // Note: API doesn't provide disciplina field, so subject filtering is disabled for now
    // if (filterSubj !== 'Todas') {
    //   list = list.filter(c => c.disciplina === filterSubj)
    // }

    if (sortBy === 'name')     list.sort((a, b) => a.nome.localeCompare(b.nome))
    // Note: API doesn't provide member counts, so student sorting is disabled
    // if (sortBy === 'students') { ... }
    if (sortBy === 'recent')   list.sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm))

    return list
  }, [classes, search, sortBy])

  const stats    = useMemo(() => buildStats(classes), [classes])
  const hasClasses = classes.length > 0
  const isFiltered = search.trim() || filterSubj !== 'Todas'

  // ── Handlers ─────────────────────────────────────────────────────────────────
  async function handleCreate(newClass) {
    try {
      const createdClass = await createTrilhaHandler(newClass)
      toast(`Trilha "${createdClass.nome}" criada com sucesso!`, 'success')
      navigate(`/professor/trilha/${createdClass.id}`, { state: createdClass })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar trilha'
      console.error('Erro ao criar trilha:', err)
      toast(msg, 'error')
      throw err
    }
  }

  function handleEdit(updated) {
    setClasses(prev => prev.map(c => c.id === updated.id ? updated : c))
    toast(`Trilha "${updated.nome}" atualizada.`, 'success')
    setEditTarget(null)
  }

  async function handleDeleteConfirm() {
    const { id, nome } = deleteTarget
    try {
      await deleteTrilhaHandler(id)
      toast(`Trilha "${nome}" excluída.`, 'error')
    } catch (err) {
      toast(err.message || 'Erro ao excluir trilha.', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  function openEdit(classObj) {
    setEditTarget(classObj)
    setClassModalOpen(true)
  }

  function openDelete(id, nome) {
    setDeleteTarget({ id, nome })
  }

  function closeClassModal() {
    setClassModalOpen(false)
    setEditTarget(null)
  }

  return (
    <TeacherLayout>

      {/* ── Modals ── */}
      {classModalOpen && (
        <CreateTrilhaModal
          onClose={closeClassModal}
          onCreate={handleCreate}
          onEdit={handleEdit}
          initialData={editTarget}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Excluir trilha"
          message={`Tem certeza que deseja excluir a trilha "${deleteTarget.nome}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir trilha"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Toasts ── */}
      <Toast toasts={toasts} onDismiss={dismiss} />

      {/* ── LOADING STATE ── */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}><Icon name="clock" size={32} /></div>
          <p>Carregando trilhas...</p>
        </div>
      )}

      {/* ── ERROR STATE ── */}
      {error && !loading && (
        <div className={styles.error}>
          <span className={styles.errorIcon}><Icon name="warning" size={40} /></span>
          <h3>Erro ao carregar trilhas</h3>
          <p>{error}</p>
          <button
            className={styles.retryBtn}
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* ── EMPTY STATE (loaded, no error, no classes) ── */}
      {!loading && !error && !hasClasses && (
        <div className={styles.heroEmpty}>
          <span className={styles.heroEmptyIcon}><Icon name="school" size={48} /></span>
          <h3 className={styles.heroEmptyTitle}>
            Está na hora de criar sua primeira trilha
          </h3>
          <p className={styles.heroEmptyDesc}>
            Organize seu conteúdo em uma trilha para seus alunos começarem a aprender.
          </p>
          <button className={styles.heroEmptyBtn} onClick={() => setClassModalOpen(true)}>
            Criar trilha
          </button>
        </div>
      )}

      {/* ── HAS CLASSES ── */}
      {hasClasses && (
        <>
          {/* Stats row */}
          <div className={styles.statsGrid}>
            {stats.map(s => (
              <div key={s.id} className={styles.statCard}>
                <span className={styles.statIcon}><Icon name={s.icon} size={20} /></span>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Classes section */}
          <section className={styles.section}>
            <div className={styles.classesHeader}>
              <div className={styles.classesHeaderTop}>
                <h3 className={styles.sectionTitle}>Minhas trilhas</h3>
                <button className={styles.newClassBtn} onClick={() => setClassModalOpen(true)}>
                  + Nova trilha
                </button>
              </div>

              {/* Search + filters */}
              <div className={styles.controls}>
                <div className={styles.searchWrap}>
                  <span className={styles.searchIcon}><Icon name="search" size={15} /></span>
                  <input
                    className={styles.searchInput}
                    placeholder="Buscar por nome, disciplina ou código…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className={styles.searchClear} onClick={() => setSearch('')} aria-label="Limpar busca">
                      ✕
                    </button>
                  )}
                </div>

                <select
                  className={styles.filterSelect}
                  value={filterSubj}
                  onChange={e => setFilterSubj(e.target.value)}
                  aria-label="Filtrar por disciplina"
                >
                  {SUBJECT_FILTERS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                  className={styles.filterSelect}
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  aria-label="Ordenar trilhas"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Results count when filtering */}
            {isFiltered && (
              <p className={styles.resultsCount}>
                {visibleClasses.length === 0
                  ? 'Nenhuma trilha encontrada.'
                  : `${visibleClasses.length} trilha${visibleClasses.length !== 1 ? 's' : ''} encontrada${visibleClasses.length !== 1 ? 's' : ''}.`}
              </p>
            )}

            {visibleClasses.length > 0 ? (
              <div className={styles.classesList}>
                {visibleClasses.map(c => (
                  <TrilhaCard
                    key={c.id}
                    {...c}
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
