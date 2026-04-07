import { useState } from 'react'
import DashboardSidebar from './DashboardSidebar'
import DashboardHeader  from './DashboardHeader'
import styles from './DashboardLayout.module.css'

const SESSION_KEY = 'sc_dashboard_entered'

export default function DashboardLayout({ children, user }) {
  const [activePage, setActivePage] = useState('home')

  // Play the entry animation only the first time per browser session.
  // sessionStorage is cleared when the tab closes, so the animation
  // plays again on a fresh session but never on F5 or back-navigation.
  const isFirstEntry = !sessionStorage.getItem(SESSION_KEY)
  if (isFirstEntry) sessionStorage.setItem(SESSION_KEY, '1')

  const shellClass = `${styles.shell} ${isFirstEntry ? styles.shellEnter : ''}`

  return (
    <div className={shellClass}>
      <DashboardSidebar active={activePage} onNavigate={setActivePage} />

      <div className={styles.main}>
        <DashboardHeader user={user} />
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}
