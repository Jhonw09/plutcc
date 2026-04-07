import styles from '../dashboard/DashboardSidebar.module.css'

// Teacher-specific nav — reuses the exact same CSS module as the student sidebar
const navItems = [
  { icon: '🏠', label: 'Início',      id: 'home'       },
  { icon: '🏫', label: 'Turmas',      id: 'classes'    },
  { icon: '👥', label: 'Alunos',      id: 'students'   },
  { icon: '📝', label: 'Atividades',  id: 'activities' },
  { icon: '📊', label: 'Relatórios',  id: 'reports'    },
  { icon: '📅', label: 'Calendário',  id: 'calendar'   },
]

const bottomItems = [
  { icon: '⚙️', label: 'Configurações', id: 'settings' },
  { icon: '❓', label: 'Ajuda',          id: 'help'     },
]

export default function TeacherSidebar({ active, onNavigate }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <svg width="160" height="26" viewBox="0 0 160 26" fill="none">
          <text x="0"  y="21" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF">Study</text>
          <text x="68" y="21" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="22" fill="#6C5CE7">Connect</text>
        </svg>
      </div>

      <nav className={styles.nav}>
        <span className={styles.navLabel}>Professor</span>
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
