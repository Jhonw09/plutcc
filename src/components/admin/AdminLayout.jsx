import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminHeader  from './AdminHeader'
import styles from '../dashboard/DashboardLayout.module.css'

const SESSION_KEY = 'sc_dashboard_entered'

export default function AdminLayout({ children }) {
  const [activePage, setActivePage] = useState('home')

  const isFirstEntry = !sessionStorage.getItem(SESSION_KEY)
  if (isFirstEntry) sessionStorage.setItem(SESSION_KEY, '1')

  return (
    <div className={`${styles.shell} ${isFirstEntry ? styles.shellEnter : ''} adminTheme`}>
      <AdminSidebar active={activePage} onNavigate={setActivePage} />
      <div className={styles.main}>
        <AdminHeader />
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}
