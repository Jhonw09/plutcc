import { useState } from 'react'
import TeacherSidebar  from './TeacherSidebar'
import DashboardHeader from '../dashboard/DashboardHeader'
import styles from '../dashboard/DashboardLayout.module.css'

export default function TeacherLayout({ children, user }) {
  const [activePage, setActivePage] = useState('home')

  return (
    <div className={styles.shell}>
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
