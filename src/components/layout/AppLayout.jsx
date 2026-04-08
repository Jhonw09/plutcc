import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { SidebarDrawer } from './SidebarDrawer'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import styles from '../dashboard/DashboardLayout.module.css'

/**
 * Generic authenticated-page shell.
 * The sidebar is now always a drawer — no static column on any viewport.
 *
 * @param {React.ComponentType} sidebar - Sidebar component (no props required)
 * @param {React.ComponentType} header  - Header component; receives onMenuOpen prop
 * @param {string} themeClass           - Optional CSS class on the root div
 */
export default function AppLayout({ sidebar: Sidebar, header: Header, themeClass = '', children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  // Close drawer on navigation
  useEffect(() => { setDrawerOpen(false) }, [location.pathname])

  const openDrawer  = useCallback(() => setDrawerOpen(true),  [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const isFirstEntry = !sessionStorage.getItem(STORAGE_KEYS.dashboardEntered)
  if (isFirstEntry) sessionStorage.setItem(STORAGE_KEYS.dashboardEntered, '1')

  return (
    <div className={`${styles.shell} ${isFirstEntry ? styles.shellEnter : ''} ${themeClass}`}>

      <SidebarDrawer open={drawerOpen} onClose={closeDrawer}>
        <Sidebar />
      </SidebarDrawer>

      <div className={styles.main}>
        <Header onMenuOpen={openDrawer} />
        <div className={styles.content}>{children}</div>
      </div>

    </div>
  )
}
