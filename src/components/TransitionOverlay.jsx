import styles from './TransitionOverlay.module.css'

/**
 * Full-screen animated overlay shown during page transitions.
 * Rendered by App — sits above everything including the auth modal.
 * @param {'in'|'out'} phase - 'out' fades in the overlay, 'in' fades it out
 * @param {string} label - message shown below the spinner
 */
export default function TransitionOverlay({ phase, label = 'Carregando...' }) {
  return (
    <div className={`${styles.overlay} ${styles[phase]}`} aria-live="polite" aria-label={label}>
      <div className={styles.inner}>
        <div className={styles.spinner}>
          <div className={styles.ring} />
          <div className={styles.ringAccent} />
        </div>
        <p className={styles.label}>{label}</p>
      </div>
    </div>
  )
}
