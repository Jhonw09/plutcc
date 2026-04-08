import styles from './ConfirmModal.module.css'

/**
 * Generic confirmation dialog.
 *
 * @param {string}   title        - Bold heading
 * @param {string}   message      - Body text
 * @param {string}   confirmLabel - Label for the destructive button
 * @param {function} onConfirm
 * @param {function} onCancel
 */
export function ConfirmModal({ title, message, confirmLabel = 'Confirmar', onConfirm, onCancel }) {
  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div
        className={styles.card}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <span className={styles.icon}>🗑️</span>
        <h3 id="confirm-title" className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancelar</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
