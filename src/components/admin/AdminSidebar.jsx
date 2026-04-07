import styles from '../dashboard/DashboardSidebar.module.css'
import adminStyles from './AdminSidebar.module.css'

const navItems = [
  { icon: '🛡️', label: 'Visão geral',   id: 'home'      },
  { icon: '👥', label: 'Usuários',       id: 'users'     },
  { icon: '🏫', label: 'Escolas',        id: 'schools'   },
  { icon: '💰', label: 'Financeiro',     id: 'finance'   },
  { icon: '📊', label: 'Relatórios',     id: 'reports'   },
  { icon: '🚨', label: 'Tickets',        id: 'tickets'   },
]

const bottomItems = [
  { icon: '⚙️', label: 'Configurações', id: 'settings' },
  { icon: '❓', label: 'Ajuda',          id: 'help'     },
]

export default function AdminSidebar({ active, onNavigate }) {
  return (
    <aside className={`${styles.sidebar} ${adminStyles.sidebar}`}>
      <div className={styles.logo}>
        <svg width="160" height="26" viewBox="0 0 160 26" fill="none">
          <text x="0"  y="21" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF">Study</text>
          <text x="68" y="21" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="22" fill="var(--accent)">Connect</text>
        </svg>
        <span className={adminStyles.adminBadge}>Admin</span>
      </div>

      <nav className={styles.nav}>
        <span className={styles.navLabel}>Administração</span>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`${styles.navItem} ${active === item.id ? styles.navItemActive : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navText}>{item.label}</span>
            {active === item.id && <span className={styles.activeBar} />}
          </button>
        ))}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.divider} />
        {bottomItems.map(item => (
          <button
            key={item.id}
            className={`${styles.navItem} ${active === item.id ? styles.navItemActive : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navText}>{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
