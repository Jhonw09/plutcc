import { useState, useMemo, useEffect } from 'react'
import TeacherLayout       from '../components/teacher/TeacherLayout'
import ClassCard           from '../components/teacher/ClassCard'
import CreateClassModal    from '../components/teacher/CreateClassModal'
import { ConfirmModal }    from '../components/ui/ConfirmModal'
import { Toast }           from '../components/ui/Toast'
import { useToast }        from '../hooks/useToast'
import { useAuth }         from '../context/AuthContext'
import { useClass }        from '../hooks/useClass'
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

// ── Derived stats from local class list ───────────────────────────────────────
function buildStats(classes) {
  const totalStudents = classes.reduce((s, c) => {
    const studentCount = (c.membros ?? []).filter(m => m.role === 'student').length
    return s + studentCount
  }, 0)
  const publicCount   = classes.filter(c => c.tipo === 'PUBLICA').length
  return [
    { id: 'classes',  icon: '🏫', label: 'Turmas ativas',   value: classes.length,  delta: null },
    { id: 'students', icon: '👥', label: 'Total de alunos', value: totalStudents,   delta: null },
    { id: 'public',   icon: '🌐', label: 'Turmas públicas', value: publicCount,     delta: null },
    { id: 'private',  icon: '🔒', label: 'Turmas privadas', value: classes.length - publicCount, delta: null },
  ]
}

export default function TeacherDashboardPage() {
  const { user } = useAuth()
  const { toasts, toast, dismiss } = useToast()
  const { getClassesByUser, loading: classesLoading, error: classesError } = useClass()

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

  // Load teacher's classes on mount
  useEffect(() => {
    async function loadClasses() {
      try {
        const teacherClasses = await getClassesByUser('teacher')
        setClasses(teacherClasses)
      } catch (err) {
        console.error('Erro ao carregar turmas:', err)
        toast('Erro ao carregar turmas. Tente novamente.', 'error')
      }
    }
    loadClasses()
  }, [getClassesByUser, toast])

  // ── Derived: filtered + sorted classes ───────────────────────────────────────
  const visibleClasses = useMemo(() => {
    let list = [...classes]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(c =>
        c.nome.toLowerCase().includes(q) ||
        c.disciplina.toLowerCase().includes(q) ||
        c.codigo.toLowerCase().includes(q)
      )
    }

    if (filterSubj !== 'Todas') {
      list = list.filter(c => c.disciplina === filterSubj)
    }

    if (sortBy === 'name')     list.sort((a, b) => a.nome.localeCompare(b.nome))
    if (sortBy === 'students') {
      list.sort((a, b) => {
        const aStudents = (a.membros ?? []).filter(m => m.role === 'student').length
        const bStudents = (b.membros ?? []).filter(m => m.role === 'student').length
        return bStudents - aStudents
      })
    }
    if (sortBy === 'recent')   list.sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm))

    return list
  }, [classes, search, filterSubj, sortBy])

  const stats    = useMemo(() => buildStats(classes), [classes])
  const hasClasses = classes.length > 0
  const isFiltered = search.trim() || filterSubj !== 'Todas'

  // ── Handlers ─────────────────────────────────────────────────────────────────
  async function handleCreate(newClass) {
    try {
      // newClass has: nome, disciplina, descricao, tipo, nivel, professorId, professorNome
      // Call classService via direct import to create this class
      const { classService } = await import('../api/services/classService')
      const createdClass = await classService.createClass(user?.id, newClass)
      setClasses(prev => [createdClass, ...prev])
      toast(`Turma "${createdClass.nome}" criada com sucesso!`, 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar turma'
      toast(msg, 'error')
    }
  }

  function handleEdit(updated) {
    setClasses(prev => prev.map(c => c.id === updated.id ? updated : c))
    toast(`Turma "${updated.nome}" atualizada.`, 'success')
    setEditTarget(null)
  }

  function handleDeleteConfirm() {
    const nome = deleteTarget.nome
    setClasses(prev => prev.filter(c => c.id !== deleteTarget.id))
    toast(`Turma "${nome}" excluída.`, 'error')
    setDeleteTarget(null)
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
        <CreateClassModal
          onClose={closeClassModal}
          onCreate={handleCreate}
          onEdit={handleEdit}
          initialData={editTarget}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Excluir turma"
          message={`Tem certeza que deseja excluir "${deleteTarget.nome}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir turma"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Toasts ── */}
      <Toast toasts={toasts} onDismiss={dismiss} />

      {/* ── EMPTY STATE ── */}
      {!hasClasses && (
        <div className={styles.heroEmpty}>
          <span className={styles.heroEmptyIcon}>🏫</span>
          <h3 className={styles.heroEmptyTitle}>
            Você ainda não criou nenhuma turma
          </h3>
          <p className={styles.heroEmptyDesc}>
            Crie uma turma, compartilhe o código com seus alunos e comece a acompanhar o desempenho deles.
          </p>
          <button className={styles.heroEmptyBtn} onClick={() => setClassModalOpen(true)}>
            + Criar primeira turma
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
                <span className={styles.statIcon}>{s.icon}</span>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Classes section */}
          <section className={styles.section}>
            <div className={styles.classesHeader}>
              <div className={styles.classesHeaderTop}>
                <h3 className={styles.sectionTitle}>Minhas turmas</h3>
                <button className={styles.newClassBtn} onClick={() => setClassModalOpen(true)}>
                  + Nova turma
                </button>
              </div>

              {/* Search + filters */}
              <div className={styles.controls}>
                <div className={styles.searchWrap}>
                  <span className={styles.searchIcon}>🔍</span>
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
                  aria-label="Ordenar turmas"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Results count when filtering */}
            {isFiltered && (
              <p className={styles.resultsCount}>
                {visibleClasses.length === 0
                  ? 'Nenhuma turma encontrada.'
                  : `${visibleClasses.length} turma${visibleClasses.length !== 1 ? 's' : ''} encontrada${visibleClasses.length !== 1 ? 's' : ''}.`}
              </p>
            )}

            {visibleClasses.length > 0 ? (
              <div className={styles.classesList}>
                {visibleClasses.map(c => (
                  <ClassCard
                    key={c.id}
                    {...c}
                    onEdit={openEdit}
                    onDelete={openDelete}
                  />
                ))}
              </div>
            ) : isFiltered ? (
              <div className={styles.emptyFilter}>
                <span className={styles.emptyFilterIcon}>🔍</span>
                <p className={styles.emptyFilterText}>
                  Nenhuma turma corresponde à sua busca.{' '}
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
