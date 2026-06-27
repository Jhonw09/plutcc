import { useNavigate, useLocation } from 'react-router-dom'
import { ADMIN_ROUTES } from '../../constants/routes'
import Icon from '../ui/Icon'
import styles from '../dashboard/DashboardSidebar.module.css'
import adminStyles from './AdminSidebar.module.css'

const navItems = [
  { icon: 'shield',    label: 'Visão geral',  path: ADMIN_ROUTES.home    },
  { icon: 'users',     label: 'Usuários',      path: ADMIN_ROUTES.users   },
  { icon: 'bookOpen',  label: 'Trilhas',       path: ADMIN_ROUTES.trilhas },
  { icon: 'alertCircle', label: 'Tickets',     path: ADMIN_ROUTES.tickets },
  { icon: 'school',    label: 'Escolas',       path: ADMIN_ROUTES.schools },
  { icon: 'dollar',    label: 'Financeiro',    path: ADMIN_ROUTES.finance },
  { icon: 'barChart',  label: 'Relatórios',    path: ADMIN_ROUTES.reports },
]

const bottomItems = [
  { icon: 'cpu',         label: 'Configurações', path: ADMIN_ROUTES.settings },
  { icon: 'alertCircle', label: 'Ajuda',         path: ADMIN_ROUTES.help     },
]

export default function AdminSidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function isActive(path) {
    return path === ADMIN_ROUTES.home ? pathname === path : pathname.startsWith(path)
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
        {navItems.map(renderItem)}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.divider} />
        {bottomItems.map(renderItem)}
      </div>
    </aside>
  )
}
