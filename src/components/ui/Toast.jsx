import styles from './Toast.module.css'

const ICONS = { success: '✓', error: '✕', info: 'ℹ' }

export function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null
  return (
    <div className={styles.stack} aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
          <span className={styles.icon}>{ICONS[t.type] ?? ICONS.info}</span>
          <span className={styles.message}>{t.message}</span>
          <button className={styles.close} onClick={() => onDismiss(t.id)} aria-label="Fechar">✕</button>
        </div>
      ))}
    </div>
  )
}
