import { useState } from 'react'
import TeacherLayout        from '../components/teacher/TeacherLayout'
import ActionCard           from '../components/teacher/ActionCard'
import ClassCard            from '../components/teacher/ClassCard'
import CreateClassModal     from '../components/teacher/CreateClassModal'
import CreateActivityModal  from '../components/teacher/CreateActivityModal'
import { useAuth }          from '../context/AuthContext'
import { quickActions }     from '../data/teacherDashboard'
import styles from './TeacherDashboardPage.module.css'

export default function TeacherDashboardPage() {
  const { user } = useAuth()

  const [classes,          setClasses]          = useState([])
  const [classModalOpen,   setClassModalOpen]   = useState(false)
  const [activityModalOpen, setActivityModalOpen] = useState(false)

  function handleCreate(newClass) {
    setClasses(prev => [newClass, ...prev])
  }

  const hasClasses  = classes.length > 0
  // Total students across all created classes (from alunoIds arrays)
  const totalStudents = classes.reduce((sum, c) => sum + (c.alunoIds?.length ?? 0), 0)
  const hasStudents = totalStudents > 0

  // Wire each action card to its own handler — no card opens the wrong modal
  const actions = quickActions.map(a => {
    if (a.id === 'create')  return { ...a, onClick: () => setActivityModalOpen(true) }
    if (a.id === 'classes') return { ...a, onClick: () => setClassModalOpen(true) }
    return a   // 'students' and 'reports' are placeholders for now
  })

  // ── Placeholder copy — three distinct states ──────────────────────────────
  function PlaceholderSection() {
    let icon, text

    if (!hasClasses) {
      icon = '🏫'
      text = 'Você ainda não criou nenhuma turma. Crie uma turma para começar.'
    } else if (!hasStudents) {
      icon = '👤'
      text = 'Nenhum aluno entrou nas suas turmas ainda. Assim que um aluno entrar, ele aparecerá aqui.'
    } else {
      // hasClasses && hasStudents — waiting for backend
      icon = '📊'
      text = 'A lista de alunos e as atividades recentes aparecerão aqui assim que o backend for conectado.'
    }

    return (
      <section className={styles.section}>
        <div className={styles.dataPlaceholder}>
          <span className={styles.dataPlaceholderIcon}>{icon}</span>
          <p className={styles.dataPlaceholderText}>{text}</p>
        </div>
      </section>
    )
  }

  return (
    <TeacherLayout>

      {classModalOpen && (
        <CreateClassModal
          onClose={() => setClassModalOpen(false)}
          onCreate={handleCreate}
        />
      )}

      {activityModalOpen && (
        <CreateActivityModal
          onClose={() => setActivityModalOpen(false)}
          classes={classes}
        />
      )}

      {/* ── Welcome — always visible ── */}
      <div className={styles.welcome}>
        <h2 className={styles.welcomeTitle}>
          Olá, Professor {user?.name ?? ''} 👋
        </h2>
        <p className={styles.welcomeSub}>
          {hasClasses
            ? <>Você tem <strong>{classes.length} turma{classes.length !== 1 ? 's' : ''}</strong> ativas.</>
            : 'Crie sua primeira turma para começar a gerenciar seus alunos.'}
        </p>
      </div>

      {/* ── NO CLASSES ── */}
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
          {/* Quick actions — each wired to its own handler */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Ações rápidas</h3>
            <div className={styles.actionsGrid}>
              {actions.map(a => <ActionCard key={a.id} {...a} />)}
            </div>
          </section>

          {/* My classes — driven entirely by real local state */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Minhas turmas</h3>
              <button className={styles.sectionLink} onClick={() => setClassModalOpen(true)}>
                + Nova turma
              </button>
            </div>
            <div className={styles.classesList}>
              {classes.map(c => <ClassCard key={c.id} {...c} />)}
            </div>
          </section>

          {/*
            TODO: replace PlaceholderSection with the real statsGrid +
            students list + activity feed once the backend is integrated.
            Endpoints: GET /api/v1/teacher/stats
                       GET /api/v1/turmas/:id/alunos
                       GET /api/v1/turmas/:id/atividades
          */}
          <PlaceholderSection />
        </>
      )}

    </TeacherLayout>
  )
}
