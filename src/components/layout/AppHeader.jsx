import { useAuth } from '../../context/AuthContext'
import Icon from '../ui/Icon'
import ProfileDropdown from '../dashboard/ProfileDropdown'
import styles from '../dashboard/DashboardHeader.module.css'

function getGreeting() {
  const hour = new Date().getHours()
  return hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
}

export default function AppHeader({ subtitle, showSearch = false, extraClass = '', onMenuOpen }) {
  const { user } = useAuth()

  return (
    <header className={`${styles.header} ${extraClass}`}>
      <div className={styles.left}>
        <button
          className={styles.hamburger}
          onClick={onMenuOpen}
          aria-label="Abrir menu"
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>

        <div className={styles.titles}>
          <h1 className={styles.greeting}>
            {getGreeting()}, <span className={styles.name}>{user?.name ?? '...'}</span>
          </h1>
          <p className={styles.sub}>{subtitle}</p>
        </div>
      </div>

      <div className={styles.right}>
        {showSearch && (
          <div className={styles.search}>
            <span className={styles.searchIcon}><Icon name="search" size={15} /></span>
            <input
              type="text"
              placeholder="Buscar aulas, exercícios..."
              className={styles.searchInput}
            />
          </div>
        )}

        <button className={styles.notifBtn} aria-label="Notificações">
          <Icon name="bell" size={18} />
          <span className={styles.notifDot} />
        </button>

        <ProfileDropdown />
      </div>
    </header>
  )
}
