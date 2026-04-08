import { useState } from 'react'
import DashboardLayout from './DashboardLayout'
import JoinClassModal  from './JoinClassModal'
import JoinedClassCard from './JoinedClassCard'
import { useAuth }     from '../../context/AuthContext'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { user } = useAuth()

  const [joinedClasses, setJoinedClasses] = useState([])
  const [modalOpen,     setModalOpen]     = useState(false)

  function handleJoin(newClass) {
    setJoinedClasses(prev => [newClass, ...prev])
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

      {/* ── NO CLASSES ── */}
      {!hasClasses && (
        <>
          <div className={styles.welcome}>
            <h2 className={styles.welcomeTitle}>Olá, {user?.name ?? 'aluno'}! 👋</h2>
            <p className={styles.welcomeSub}>
              Bem-vindo ao StudyConnect. Entre em uma turma para começar.
            </p>
          </div>

          <div className={styles.heroEmpty}>
            <span className={styles.heroEmptyIcon}>🏫</span>
            <h3 className={styles.heroEmptyTitle}>
              Você ainda não está matriculado em nenhuma turma
            </h3>
            <p className={styles.heroEmptyDesc}>
              Insira o código que seu professor compartilhou ou explore turmas públicas na Comunidade.
            </p>
            <button className={styles.heroEmptyBtn} onClick={() => setModalOpen(true)}>
              + Entrar em uma turma
            </button>
          </div>
        </>
      )}

      {/* ── HAS CLASSES ── */}
      {hasClasses && (
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