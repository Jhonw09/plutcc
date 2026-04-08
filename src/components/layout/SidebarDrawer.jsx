import { useEffect } from 'react'
import styles from './SidebarDrawer.module.css'

/**
 * Reusable slide-in drawer that wraps any sidebar content.
 * Used by both Teacher and Student layouts via AppLayout.
 *
 * @param {boolean}  open      - Whether the drawer is visible
 * @param {function} onClose   - Called when the user dismisses the drawer
 * @param {React.ReactNode} children - The sidebar component to render inside
 */
export function SidebarDrawer({ open, onClose, children }) {
  // Close on ESC
  useEffect(() => {
    if (!open) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Prevent body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${open ? styles.overlayVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        {/* Close button inside drawer */}
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Fechar menu"
        >
          ✕
        </button>

        {children}
      </div>
    </>
  )
}
