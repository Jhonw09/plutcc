import { useState } from 'react'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import styles from '../dashboard/DashboardLayout.module.css'
import sidebarStyles from '../dashboard/DashboardSidebar.module.css'

/**
 * Generic authenticated-page shell.
 * Accepts any Sidebar and Header component as props so each role
 * can plug in its own without duplicating layout logic.
 *
 * @param {React.ComponentType} sidebar  - Sidebar component (receives active + onNavigate)
 * @param {React.ComponentType} header   - Header component (no props required)
 * @param {string}              themeClass - Optional CSS class on the root div (e.g. 'adminTheme')
 */
export default function AppLayout({ sidebar: Sidebar, header: Header, themeClass = '', children }) {
  const [activePage,  setActivePage]  = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isFirstEntry = !sessionStorage.getItem(STORAGE_KEYS.dashboardEntered)
  if (isFirstEntry) sessionStorage.setItem(STORAGE_KEYS.dashboardEntered, '1')

  function closeSidebar() { setSidebarOpen(false) }

  return (
    <div className={`${styles.shell} ${isFirstEntry ? styles.shellEnter : ''} ${themeClass}`}>

      {sidebarOpen && <div className={styles.sidebarOverlay} onClick={closeSidebar} />}

      <div className={sidebarOpen ? sidebarStyles.sidebarOpen : ''}>
        <Sidebar active={activePage} onNavigate={(id) => { setActivePage(id); closeSidebar() }} />
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
