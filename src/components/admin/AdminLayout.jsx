import { useState } from 'react'
import TeacherSidebar  from '../teacher/TeacherSidebar'
import DashboardHeader from '../dashboard/DashboardHeader'
import styles from '../dashboard/DashboardLayout.module.css'

const SESSION_KEY = 'sc_dashboard_entered'

export default function AdminLayout({ children, user }) {
  const [activePage, setActivePage] = useState('home')

  const isFirstEntry = !sessionStorage.getItem(SESSION_KEY)
  if (isFirstEntry) sessionStorage.setItem(SESSION_KEY, '1')

  return (
    <div className={`${styles.shell} ${isFirstEntry ? styles.shellEnter : ''} adminTheme`}>
      <TeacherSidebar active={activePage} onNavigate={setActivePage} />
      <div className={styles.main}>
        <DashboardHeader user={user} />
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}
