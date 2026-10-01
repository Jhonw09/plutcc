import { useState } from 'react'
import Icon from './Icon'
import { InputField } from './InputField'
import styles from './MfaSecuritySection.module.css'

/**
 * Modal para aluno informar o código de acesso de uma trilha privada.
 *
 * Props:
 *  - trilhaNome: string
 *  - onConfirm: (codigo) => Promise<void>
 *  - onCancel: () => void
 */
export default function CodigoAcessoModal({ trilhaNome, onConfirm, onCancel }) {
  const [codigo,  setCodigo]  = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!codigo.trim()) { setError('Informe o código de acesso.'); return }
    setError('')
    setLoading(true)
    try {
      await onConfirm(codigo.trim().toUpperCase())
    } catch (err) {
      setError(err.message || 'Código inválido.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="codigo-modal-title"
      >
        <div className={styles.modalIcon} style={{ background: 'rgba(108,92,231,.1)', borderColor: 'rgba(108,92,231,.3)', color: 'var(--accent)' }}>
          <Icon name="lock" size={26} />
        </div>

        <h3 id="codigo-modal-title" className={styles.modalTitle}>Trilha privada</h3>

        <p className={styles.modalDesc}>
          <strong>{trilhaNome}</strong> é uma trilha privada. Informe o código de acesso fornecido pelo professor para continuar.
        </p>

        <form onSubmit={handleSubmit} noValidate className={styles.modalForm}>
          <InputField
            id="codigo-acesso"
            label="Código de acesso"
            type="text"
            placeholder="Ex: ABCD1234EFGH"
            value={codigo}
            onChange={e => { setCodigo(e.target.value.toUpperCase()); setError('') }}
            error={error}
            disabled={loading}
            autoFocus
          />
          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={styles.confirmBtnDisable} disabled={loading || !codigo.trim()}>
              {loading ? 'Verificando…' : 'Acessar trilha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
