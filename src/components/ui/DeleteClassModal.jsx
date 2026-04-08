import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ENDPOINTS } from '../../api/config'
import styles from './DeleteClassModal.module.css'

/**
 * Secure delete confirmation for a class.
 * Verifies the teacher's password via POST /auth/login before proceeding.
 *
 * @param {string}   className - Name of the class being deleted
 * @param {function} onConfirm - Called after password is verified
 * @param {function} onCancel
 */
export function DeleteClassModal({ className, onConfirm, onCancel }) {
  const { user } = useAuth()
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!password.trim()) { setError('Digite sua senha.'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(ENDPOINTS.login, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: user.email, senha: password }),
      })

      if (!res.ok) {
        setError('Senha incorreta. Tente novamente.')
        setLoading(false)
        return
      }

      onConfirm()
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div
        className={styles.card}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
      >
        <div className={styles.iconWrap}>
          <span className={styles.icon}>🗑️</span>
        </div>

        <h3 id="delete-title" className={styles.title}>Excluir turma</h3>

        <p className={styles.message}>
          Você está prestes a excluir{' '}
          <strong className={styles.className}>"{className}"</strong>.
          Esta ação é permanente e não pode ser desfeita.
        </p>

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <div className={styles.fieldWrap}>
            <label htmlFor="delete-password" className={styles.label}>
              Confirme sua senha para continuar
            </label>
            <input
              id="delete-password"
              type="password"
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              placeholder="Sua senha"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              autoFocus
              autoComplete="current-password"
              disabled={loading}
            />
            {error && (
              <span className={styles.error} role="alert">{error}</span>
            )}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.confirmBtn}
              disabled={loading || !password.trim()}
            >
              {loading ? 'Verificando…' : 'Excluir turma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
