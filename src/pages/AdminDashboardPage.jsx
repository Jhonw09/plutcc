import { useEffect, useState } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import Icon from '../components/ui/Icon'
import { useAuth } from '../context/AuthContext'
import { getUsuarios } from '../api/services/adminService'
import { getTrilhasAdmin } from '../api/services/adminService'
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

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [trilhas,  setTrilhas]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([getUsuarios(), getTrilhasAdmin()])
      .then(([u, t]) => { setUsuarios(u); setTrilhas(t) })
      .finally(() => setLoading(false))
  }, [])

  const alunos     = usuarios.filter(u => u.tipoUsuario === 'ALUNO')
  const professors = usuarios.filter(u => u.tipoUsuario === 'PROFESSOR')
  const totalMatriculas = trilhas.reduce((acc, t) => acc + (t.totalAlunos ?? 0), 0)

  const stats = [
    { id: 'usuarios',    icon: 'users',       label: 'Usuários',          value: usuarios.length },
    { id: 'alunos',      icon: 'user',        label: 'Alunos',            value: alunos.length },
    { id: 'professores', icon: 'school',      label: 'Professores',       value: professors.length },
    { id: 'trilhas',     icon: 'book',        label: 'Trilhas',           value: trilhas.length },
    { id: 'matriculas',  icon: 'checkCircle', label: 'Matrículas totais', value: totalMatriculas },
  ]

  const recentUsers = [...usuarios]
    .sort((a, b) => b.id - a.id)
    .slice(0, 6)

  const ROLE_LABEL = { ADMIN: 'Admin', PROFESSOR: 'Professor', ALUNO: 'Aluno' }

  return (
    <AdminLayout>
      <div className={styles.page}>

        <div className={styles.welcome}>
          <h2 className={styles.welcomeTitle}>Painel Administrativo</h2>
          <p className={styles.welcomeSub}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        <div className={styles.statsGrid}>
          {stats.map(s => <StatCard key={s.id} {...s} loading={loading} />)}
        </div>

        <div className={styles.row}>

          {/* Últimos usuários */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Últimos usuários cadastrados</h3>
            {loading ? (
              <p className={styles.loadingText}>Carregando...</p>
            ) : (
              <div className={styles.userList}>
                {recentUsers.map(u => (
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

          {/* Trilhas com mais alunos */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Trilhas mais populares</h3>
            {loading ? (
              <p className={styles.loadingText}>Carregando...</p>
            ) : (
              <div className={styles.trilhaList}>
                {[...trilhas]
                  .sort((a, b) => (b.totalAlunos ?? 0) - (a.totalAlunos ?? 0))
                  .slice(0, 6)
                  .map(t => (
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
