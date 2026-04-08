import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import styles from '../dashboard/DashboardLayout.module.css'
import sidebarStyles from '../dashboard/DashboardSidebar.module.css'

/**
 * Generic authenticated-page shell.
 * Accepts any Sidebar and Header component as props so each role
 * can plug in its own without duplicating layout logic.
 * Active sidebar item is derived from the URL — no prop needed.
 *
 * @param {React.ComponentType} sidebar    - Sidebar component (no props required)
 * @param {React.ComponentType} header     - Header component (no props required)
 * @param {string}              themeClass - Optional CSS class on the root div
 */
export default function AppLayout({ sidebar: Sidebar, header: Header, themeClass = '', children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close mobile sidebar whenever the route changes
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  const isFirstEntry = !sessionStorage.getItem(STORAGE_KEYS.dashboardEntered)
  if (isFirstEntry) sessionStorage.setItem(STORAGE_KEYS.dashboardEntered, '1')

  return (
    <div className={`${styles.shell} ${isFirstEntry ? styles.shellEnter : ''} ${themeClass}`}>

      {sidebarOpen && <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />}

      <div className={sidebarOpen ? sidebarStyles.sidebarOpen : ''}>
        <Sidebar />
      </div>

      <div className={styles.main}>
        <Header />
        <div className={styles.content}>{children}</div>
      </div>

      <button
        className={styles.sidebarToggle}
        onClick={() => setSidebarOpen(o => !o)}
        aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

    </div>
  )
}
