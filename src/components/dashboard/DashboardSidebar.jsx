import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { STUDENT_ROUTES } from '../../constants/routes'
import { useAuth } from '../../context/AuthContext'
import { api, ENDPOINTS } from '../../api/apiClient'
import Icon from '../ui/Icon'
import styles from './DashboardSidebar.module.css'

const navItems = [
  { icon: 'home',          label: 'Início',      path: STUDENT_ROUTES.home       },
  { icon: 'bookOpen',      label: 'Trilhas',     path: STUDENT_ROUTES.trilhas    },
  { icon: 'barChart',      label: 'Desempenho',  path: STUDENT_ROUTES.desempenho },
  { icon: 'alertCircle',   label: 'Dúvidas',     path: STUDENT_ROUTES.duvidas    },
  { icon: 'pencil',        label: 'Exercícios',  path: STUDENT_ROUTES.exercises  },
  { icon: 'clipboard',     label: 'Simulados',   path: STUDENT_ROUTES.exams      },
  { icon: 'target',        label: 'Metas',       path: STUDENT_ROUTES.goals      },
]

const bottomItems = [
  { icon: 'cpu',         label: 'Configurações', path: STUDENT_ROUTES.settings },
  { icon: 'alertCircle', label: 'Ajuda',         path: STUDENT_ROUTES.help     },
]

export default function DashboardSidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const [respondidas, setRespondidas] = useState(0)

  useEffect(() => {
    if (!user?.id) return
    api(`${ENDPOINTS.duvidas}?alunoId=${user.id}`)
      .then(data => setRespondidas((data ?? []).filter(d => d.resposta).length))
      .catch(() => {})
  }, [user?.id])

  function isActive(path) {
    return path === STUDENT_ROUTES.home ? pathname === path : pathname.startsWith(path)
  }

  function renderItem(item) {
    const active = isActive(item.path)
    const isDuvidas = item.path === STUDENT_ROUTES.duvidas
    return (
      <button
        key={item.path}
        className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
        onClick={() => navigate(item.path)}
      >
        <span className={styles.navIcon}><Icon name={item.icon} size={17} /></span>
        <span className={styles.navText}>{item.label}</span>
        {isDuvidas && respondidas > 0 && (
          <span className={styles.badge}>{respondidas}</span>
        )}
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
        <span className={styles.navLabel}>Menu</span>
        {navItems.map(renderItem)}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.divider} />
        {bottomItems.map(renderItem)}
      </div>
    </aside>
  )
}
