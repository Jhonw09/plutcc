import { useEffect, useState } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import Icon from '../components/ui/Icon'
import { getAdminResumo } from '../api/services/adminService'
import styles from './AdminDashboardPage.module.css'

function StatCard({ icon, label, value, loading }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statIcon}><Icon name={icon} size={20} /></span>
      <span className={styles.statValue}>{loading ? '—' : value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

const ROLE_LABEL = { ADMIN: 'Admin', PROFESSOR: 'Professor', ALUNO: 'Aluno' }

export default function AdminDashboardPage() {
  const [resumo,  setResumo]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    getAdminResumo()
      .then(setResumo)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { id: 'usuarios',    icon: 'users',       label: 'Usuários',          value: resumo?.totalUsuarios    ?? 0 },
    { id: 'alunos',      icon: 'user',        label: 'Alunos',            value: resumo?.totalAlunos      ?? 0 },
    { id: 'professores', icon: 'school',      label: 'Professores',       value: resumo?.totalProfessores ?? 0 },
    { id: 'trilhas',     icon: 'book',        label: 'Trilhas',           value: resumo?.totalTrilhas     ?? 0 },
    { id: 'matriculas',  icon: 'checkCircle', label: 'Matrículas totais', value: resumo?.totalMatriculas  ?? 0 },
  ]

  const trilhasPopulares = [...(resumo?.trilhas ?? [])]
    .sort((a, b) => (b.totalAlunos ?? 0) - (a.totalAlunos ?? 0))
    .slice(0, 6)

  return (
    <AdminLayout>
      <div className={styles.page}>

        <div className={styles.welcome}>
          <h2 className={styles.welcomeTitle}>Painel Administrativo</h2>
          <p className={styles.welcomeSub}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}

        <div className={styles.statsGrid}>
          {stats.map(s => <StatCard key={s.id} {...s} loading={loading} />)}
        </div>

        <div className={styles.row}>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Últimos usuários cadastrados</h3>
            {loading ? (
              <p className={styles.loadingText}>Carregando...</p>
            ) : (
              <div className={styles.userList}>
                {(resumo?.recentUsers ?? []).map(u => (
                  <div key={u.id} className={styles.userItem}>
                    <span className={styles.userAvatar}>{u.nome?.charAt(0).toUpperCase()}</span>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{u.nome}</span>
                      <span className={styles.userEmail}>{u.email}</span>
                    </div>
                    <span className={`${styles.roleBadge} ${styles[u.tipoUsuario?.toLowerCase()]}`}>
                      {ROLE_LABEL[u.tipoUsuario] ?? u.tipoUsuario}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Trilhas mais populares</h3>
            {loading ? (
              <p className={styles.loadingText}>Carregando...</p>
            ) : (
              <div className={styles.trilhaList}>
                {trilhasPopulares.map(t => (
                  <div key={t.id} className={styles.trilhaItem}>
                    <div className={styles.trilhaInfo}>
                      <span className={styles.trilhaNome}>{t.nome}</span>
                      <span className={styles.trilhaProf}>{t.professorNome ?? '—'}</span>
                    </div>
                    <div className={styles.trilhaAlunos}>
                      <Icon name="users" size={12} />
                      {t.totalAlunos ?? 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </AdminLayout>
  )
}
