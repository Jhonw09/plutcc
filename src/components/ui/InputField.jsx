import styles from './InputField.module.css'

/**
 * Reusable labeled input.
 * Shows a red error message below when `error` is provided.
 */
export function InputField({ id, label, error, ...props }) {
  return (
    <div className={styles.wrap}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input
        id={id}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...props}
      />
      {error && <span className={styles.error} role="alert">{error}</span>}
    </div>
  )
}
