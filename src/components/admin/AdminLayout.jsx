import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminHeader  from './AdminHeader'
import styles from '../dashboard/DashboardLayout.module.css'
import sidebarStyles from '../dashboard/DashboardSidebar.module.css'

const SESSION_KEY = 'sc_dashboard_entered'

export default function AdminLayout({ children }) {
  const [activePage,  setActivePage]  = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isFirstEntry = !sessionStorage.getItem(SESSION_KEY)
  if (isFirstEntry) sessionStorage.setItem(SESSION_KEY, '1')

  function closeSidebar() { setSidebarOpen(false) }

  return (
    <div className={`${styles.shell} ${isFirstEntry ? styles.shellEnter : ''} adminTheme`}>

      {sidebarOpen && <div className={styles.sidebarOverlay} onClick={closeSidebar} />}

      <div className={sidebarOpen ? sidebarStyles.sidebarOpen : ''}>
        <AdminSidebar active={activePage} onNavigate={(id) => { setActivePage(id); closeSidebar() }} />
      </div>

      <div className={styles.main}>
        <AdminHeader />
        <div className={styles.content}>
          {children}
        </div>
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
