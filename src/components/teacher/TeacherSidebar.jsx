import { useNavigate, useLocation } from 'react-router-dom'
import { TEACHER_ROUTES } from '../../constants/routes'
import Icon from '../ui/Icon'
import styles from '../dashboard/DashboardSidebar.module.css'

const navItems = [
  { icon: 'home',     label: 'Início',        path: TEACHER_ROUTES.home    },
  { icon: 'bookOpen', label: 'Minhas trilhas', path: TEACHER_ROUTES.trilhas },
  { icon: 'barChart', label: 'Relatórios',     path: TEACHER_ROUTES.reports },
]

const bottomItems = [
  { icon: 'cpu', label: 'Configurações', path: TEACHER_ROUTES.settings },
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
        <span className={styles.navIcon}><Icon name={item.icon} size={17} /></span>
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
