import styles from './ToggleForm.module.css'

/**
 * Renders the contextual footer links inside the auth form.
 * - Login mode:  "Esqueceu a senha?" (only if onForgotPassword is provided) + "Criar conta"
 * - Signup mode: "Já tem uma conta? Entrar"
 */
export function ToggleForm({ mode, onToggle, onForgotPassword }) {
  if (mode === 'login') {
    return (
      <div className={styles.wrap}>
        {onForgotPassword && (
          <button type="button" className={styles.link} onClick={onForgotPassword}>
            Esqueceu a senha?
          </button>
        )}
        <p className={styles.text}>
          Não tem uma conta?{' '}
          <button type="button" className={styles.link} onClick={onToggle}>
            Criar conta
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.text}>
        Já tem uma conta?{' '}
        <button type="button" className={styles.link} onClick={onToggle}>
          Entrar
        </button>
      </p>
    </div>
  )
}
