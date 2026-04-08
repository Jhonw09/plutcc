import { useAuth } from '../../context/AuthContext'
import ProfileDropdown from '../dashboard/ProfileDropdown'
import styles from '../dashboard/DashboardHeader.module.css'

function getGreeting() {
  const hour = new Date().getHours()
  return hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
}

/**
 * Generic authenticated-page header.
 *
 * @param {string}  subtitle   - Line below the greeting
 * @param {string}  emoji      - Emoji after the user's name (default 👋)
 * @param {boolean} showSearch - Whether to render the search bar (default false)
 * @param {string}  extraClass - Optional extra CSS class on the <header> element
 */
export default function AppHeader({ subtitle, emoji = '👋', showSearch = false, extraClass = '' }) {
  const { user } = useAuth()

  return (
    <header className={`${styles.header} ${extraClass}`}>
      <div className={styles.left}>
        <h1 className={styles.greeting}>
          {getGreeting()}, <span className={styles.name}>{user?.name ?? '...'}</span> {emoji}
        </h1>
        <p className={styles.sub}>{subtitle}</p>
      </div>

      <div className={styles.right}>
        {showSearch && (
          <div className={styles.search}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Buscar aulas, exercícios..."
              className={styles.searchInput}
            />
          </div>
        )}

        <button className={styles.notifBtn} aria-label="Notificações">
          🔔
          <span className={styles.notifDot} />
        </button>

        <ProfileDropdown />
      </div>
    </header>
  )
}
