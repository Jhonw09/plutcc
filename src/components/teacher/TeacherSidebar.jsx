import { useNavigate, useLocation } from 'react-router-dom'
import { TEACHER_ROUTES } from '../../constants/routes'
import styles from '../dashboard/DashboardSidebar.module.css'

const navItems = [
  { icon: '🏠', label: 'Início',      path: TEACHER_ROUTES.home       },
  { icon: '🏫', label: 'Turmas',      path: TEACHER_ROUTES.classes    },
  { icon: '👥', label: 'Alunos',      path: TEACHER_ROUTES.students   },
  { icon: '📝', label: 'Atividades',  path: TEACHER_ROUTES.activities },
  { icon: '📊', label: 'Relatórios',  path: TEACHER_ROUTES.reports    },
  { icon: '📅', label: 'Calendário',  path: TEACHER_ROUTES.calendar   },
]

const bottomItems = [
  { icon: '⚙️', label: 'Configurações', path: TEACHER_ROUTES.settings },
  { icon: '❓', label: 'Ajuda',          path: TEACHER_ROUTES.help     },
]

export default function TeacherSidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function isActive(path) {
    return path === TEACHER_ROUTES.home ? pathname === path : pathname.startsWith(path)
  }

  function renderItem(item) {
    const active = isActive(item.path)
    return (
      <button
        key={item.path}
        className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
        onClick={() => navigate(item.path)}
      >
        <span className={styles.navIcon}>{item.icon}</span>
        <span className={styles.navText}>{item.label}</span>
        {active && <span className={styles.activeBar} />}
      </button>
    )
  }

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
        {navItems.map(renderItem)}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.divider} />
        {bottomItems.map(renderItem)}
      </div>
    </aside>
  )
}
