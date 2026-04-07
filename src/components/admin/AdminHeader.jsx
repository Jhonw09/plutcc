import { useAuth } from '../../context/AuthContext'
import ProfileDropdown from '../dashboard/ProfileDropdown'
import styles from '../dashboard/DashboardHeader.module.css'
import adminStyles from './AdminHeader.module.css'

export default function AdminHeader() {
  const { user } = useAuth()
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <header className={`${styles.header} ${adminStyles.header}`}>
      {/* Left — greeting */}
      <div className={styles.left}>
        <h1 className={styles.greeting}>
          {greeting}, <span className={styles.name}>{user?.name ?? '...'}</span> 🛡️
        </h1>
        <p className={styles.sub}>Painel administrativo — visão geral da plataforma</p>
      </div>

      {/* Right — notifications + profile only (no search for admin) */}
      <div className={styles.right}>
        <button className={styles.notifBtn} aria-label="Notificações">
          🔔
          <span className={styles.notifDot} />
        </button>

        <ProfileDropdown />
      </div>
    </header>
  )
}
