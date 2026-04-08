import TeacherLayout from '../components/teacher/TeacherLayout'
import StatCard      from '../components/teacher/StatCard'
import ActionCard    from '../components/teacher/ActionCard'
import StudentItem   from '../components/teacher/StudentItem'
import ActivityItem  from '../components/teacher/ActivityItem'
import { useAuth }   from '../context/AuthContext'
import {
  teacherStats,
  quickActions,
  students,
  recentActivity,
  atRiskStudents,
} from '../data/teacherDashboard'
import styles from './TeacherDashboardPage.module.css'

export default function TeacherDashboardPage() {
  const { user } = useAuth()
  return (
    <TeacherLayout>

      {/* ── Alert banner — only shown when at-risk students exist ── */}
      {atRiskStudents.length > 0 && (
        <div className={styles.alert}>
          <span className={styles.alertIcon}>⚠️</span>
          <p className={styles.alertText}>
            <strong>{atRiskStudents.length} aluno{atRiskStudents.length > 1 ? 's' : ''} com baixo desempenho</strong>
            {' '}— {atRiskStudents.map(s => s.name).join(', ')}
          </p>
          <button className={styles.alertBtn}>Ver detalhes</button>
        </div>
      )}

      {/* ── Welcome ── */}
      <div className={styles.welcome}>
        <div>
          <h2 className={styles.welcomeTitle}>
            Olá, Professor {user?.name ?? ''} 👋
          </h2>
          <p className={styles.welcomeSub}>
            Você tem <strong>{students.length} alunos</strong> em{' '}
            <strong>6 turmas</strong> com progresso médio de <strong>74%</strong>.
          </p>
        </div>
      </div>

      {/* ── Overview stats ── */}
      <div className={styles.statsGrid}>
        {teacherStats.map(s => (
          <StatCard key={s.id} {...s} />
        ))}
      </div>

      {/* ── Quick actions ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Ações rápidas</h3>
        <div className={styles.actionsGrid}>
          {quickActions.map(a => (
            <ActionCard key={a.id} {...a} />
          ))}
        </div>
      </section>

      {/* ── Two-column: students + activity ── */}
      <div className={styles.row}>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Alunos</h3>
            <button className={styles.sectionLink}>Ver todos →</button>
          </div>
          {students.map(s => (
            <StudentItem key={s.id} {...s} />
          ))}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Atividade recente</h3>
          {recentActivity.map(a => (
            <ActivityItem key={a.id} {...a} />
          ))}
        </section>

      </div>

    </TeacherLayout>
  )
}
