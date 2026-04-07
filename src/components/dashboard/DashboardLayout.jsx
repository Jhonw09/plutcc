import { useState } from 'react'
import DashboardSidebar from './DashboardSidebar'
import DashboardHeader  from './DashboardHeader'
import styles from './DashboardLayout.module.css'
import sidebarStyles from './DashboardSidebar.module.css'

const SESSION_KEY = 'sc_dashboard_entered'

export default function DashboardLayout({ children, user }) {
  const [activePage,   setActivePage]   = useState('home')
  const [sidebarOpen,  setSidebarOpen]  = useState(false)

  const isFirstEntry = !sessionStorage.getItem(SESSION_KEY)
  if (isFirstEntry) sessionStorage.setItem(SESSION_KEY, '1')

  function closeSidebar() { setSidebarOpen(false) }

  return (
    <div className={`${styles.shell} ${isFirstEntry ? styles.shellEnter : ''}`}>

      {/* Dim overlay — only rendered (and visible) on mobile when sidebar is open */}
      {sidebarOpen && <div className={styles.sidebarOverlay} onClick={closeSidebar} />}

      {/* Sidebar receives open class on mobile */}
      <div className={sidebarOpen ? sidebarStyles.sidebarOpen : ''}>
        <DashboardSidebar active={activePage} onNavigate={(id) => { setActivePage(id); closeSidebar() }} />
      </div>

      <div className={styles.main}>
        <DashboardHeader user={user} />
        <div className={styles.content}>
          {children}
        </div>
      </div>

      {/* Floating hamburger — only visible on mobile via CSS */}
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
