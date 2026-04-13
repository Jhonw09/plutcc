import { useState, useEffect } from 'react'
import DashboardLayout from './DashboardLayout'
import TrilhaCard from './TrilhaCard'
import { useTrilhas } from '../../hooks/useTrilhas'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { trilhas, loading, error, refreshTrilhas } = useTrilhas()

  const [startedTrilhas, setStartedTrilhas] = useState([])

  // Fetch available trilhas on mount
  useEffect(() => {
    // Trilhas are loaded by the hook
  }, [])

  async function handleStartTrilha(trilha) {
    // For now, just add to started trilhas
    // In future, this could call an API to enroll
    setStartedTrilhas(prev => [...prev, trilha])
  }

  const availableTrilhas = trilhas.filter(t => !startedTrilhas.find(st => st.id === t.id))
  const hasTrilhas = trilhas.length > 0

  return (
    <DashboardLayout>

      {/* ── LOADING ── */}
      {loading && (
        <div className={styles.heroEmpty}>
          <span className={styles.heroEmptyIcon}>⏳</span>
          <h3 className={styles.heroEmptyTitle}>Carregando trilhas...</h3>
        </div>
      )}

      {/* ── ERROR ── */}
      {error && (
        <div className={styles.heroEmpty}>
          <span className={styles.heroEmptyIcon}>⚠️</span>
          <h3 className={styles.heroEmptyTitle}>Erro ao carregar trilhas</h3>
          <p className={styles.heroEmptyDesc}>{error}</p>
        </div>
      )}

      {/* ── NO TRILHAS ── */}
      {!loading && !error && !hasTrilhas && (
        <div className={styles.heroEmpty}>
          <span className={styles.heroEmptyIcon}>📚</span>
          <h3 className={styles.heroEmptyTitle}>
            Nenhuma trilha disponível
          </h3>
          <p className={styles.heroEmptyDesc}>
            Ainda não há trilhas de estudo disponíveis. Volte mais tarde!
          </p>
        </div>
      )}

      {/* ── HAS TRILHAS ── */}
      {!loading && !error && hasTrilhas && (
        <>
          {/* Started Trilhas */}
          {startedTrilhas.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Trilhas iniciadas</h3>
              </div>
              <div className={styles.classesList}>
                {startedTrilhas.map(t => (
                  <TrilhaCard key={t.id} trilha={t} started={true} />
                ))}
              </div>
            </section>
          )}

          {/* Available Trilhas */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Trilhas disponíveis</h3>
            </div>
            <div className={styles.classesList}>
              {availableTrilhas.map(t => (
                <TrilhaCard key={t.id} trilha={t} onStart={() => handleStartTrilha(t)} />
              ))}
            </div>
          </section>
        </>
      )}

    </DashboardLayout>
  )
}