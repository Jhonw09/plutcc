import { useState } from 'react'
import DashboardSidebar from './DashboardSidebar'
import DashboardHeader  from './DashboardHeader'
import styles from './DashboardLayout.module.css'

export default function DashboardLayout({ children, user }) {
  const [activePage, setActivePage] = useState('home')

  return (
    <div className={styles.shell}>
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
