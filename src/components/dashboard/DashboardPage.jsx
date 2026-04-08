import { useState, useEffect } from 'react'
import DashboardLayout from './DashboardLayout'
import JoinClassModal  from './JoinClassModal'
import JoinedClassCard from './JoinedClassCard'
import { useClass }    from '../../hooks/useClass'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { getClassesByUser, loading, error } = useClass()

  const [joinedClasses, setJoinedClasses] = useState([])
  const [modalOpen,     setModalOpen]     = useState(false)

  // Fetch enrolled classes on mount
  useEffect(() => {
    async function loadClasses() {
      try {
        const classes = await getClassesByUser('student')
        // Ensure all classes have membros array
        const safeClasses = (classes ?? []).map(c => ({
          ...c,
          membros: c.membros ?? [],
        }))
        setJoinedClasses(safeClasses)
      } catch (err) {
        console.error('Erro ao carregar turmas:', err)
        setJoinedClasses([])
      }
    }
    loadClasses()
  }, [getClassesByUser])

  async function handleJoin(newClass) {
    // Immediately refetch all classes to sync with localStorage
    try {
      const classes = await getClassesByUser('student')
      // Ensure all classes have membros array with proper structure
      const safeClasses = (classes ?? []).map(c => ({
        ...c,
        membros: c.membros ?? [],
      }))
      setJoinedClasses(safeClasses)
      setModalOpen(false)
    } catch (err) {
      console.error('Erro ao sincronizar turmas:', err)
      // Fallback: at least update the state with the new class
      const safeNewClass = {
        ...newClass,
        membros: newClass.membros ?? [],
      }
      setJoinedClasses(prev => [safeNewClass, ...prev])
    }
  }

  const joinedCodes = joinedClasses.map(c => c.codigo)
  const hasClasses  = joinedClasses.length > 0

  return (
    <DashboardLayout>

      {modalOpen && (
        <JoinClassModal
          onClose={() => setModalOpen(false)}
          onJoin={handleJoin}
          joinedCodes={joinedCodes}
        />
      )}

      {/* ── LOADING ── */}
      {loading && (
        <div className={styles.heroEmpty}>
          <span className={styles.heroEmptyIcon}>⏳</span>
          <h3 className={styles.heroEmptyTitle}>Carregando turmas...</h3>
        </div>
      )}

      {/* ── ERROR ── */}
      {error && (
        <div className={styles.heroEmpty}>
          <span className={styles.heroEmptyIcon}>⚠️</span>
          <h3 className={styles.heroEmptyTitle}>Erro ao carregar turmas</h3>
          <p className={styles.heroEmptyDesc}>{error}</p>
        </div>
      )}

      {/* ── NO CLASSES ── */}
      {!loading && !error && !hasClasses && (
        <div className={styles.heroEmpty}>
          <span className={styles.heroEmptyIcon}>🏫</span>
          <h3 className={styles.heroEmptyTitle}>
            Você ainda não está em nenhuma turma
          </h3>
          <p className={styles.heroEmptyDesc}>
            Insira o código que seu professor compartilhou para entrar em uma turma.
          </p>
          <button className={styles.heroEmptyBtn} onClick={() => setModalOpen(true)}>
            + Entrar em uma turma
          </button>
        </div>
      )}

      {/* ── HAS CLASSES ── */}
      {!loading && !error && hasClasses && (
        <>
          {/* My Classes — driven entirely by real local state */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Minhas turmas</h3>
              <button className={styles.sectionAction} onClick={() => setModalOpen(true)}>
                + Entrar em uma turma
              </button>
            </div>
            <div className={styles.classesList}>
              {joinedClasses.map(c => (
                <JoinedClassCard key={c.codigo} {...c} />
              ))}
            </div>
          </section>

          {/*
            Progress, activity, and weekly stats will be populated here
            once the backend returns real data for the enrolled classes.
            Replace this placeholder with the banner + two-column row + activity section.
          */}
          <section className={styles.section}>
            <div className={styles.dataPlaceholder}>
              <span className={styles.dataPlaceholderIcon}>📊</span>
              <p className={styles.dataPlaceholderText}>
                Seu progresso e atividades aparecerão aqui assim que você começar a estudar nas suas turmas.
              </p>
            </div>
          </section>
        </>
      )}

    </DashboardLayout>
  )
}