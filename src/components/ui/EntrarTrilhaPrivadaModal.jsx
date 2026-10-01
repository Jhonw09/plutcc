import { useState } from 'react'
import Icon from './Icon'
import { InputField } from './InputField'
import { solicitarAcessoPorCodigo } from '../../api/services/trilhaService'
import styles from './MfaSecuritySection.module.css'

const ERROR_MAP = {
  401: 'Código de acesso inválido.',
  403: 'Acesso negado a esta trilha.',
  404: 'Nenhuma trilha encontrada com este código.',
  409: 'Você já possui acesso a esta trilha.',
  400: 'Código inválido. Verifique e tente novamente.',
}

export default function EntrarTrilhaPrivadaModal({ onSuccess, onCancel }) {
  const [codigo,  setCodigo]  = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const cod = codigo.trim().toUpperCase()
    if (!cod) { setError('Informe o código de acesso.'); return }

    setError('')
    setLoading(true)
    try {
      await solicitarAcessoPorCodigo(cod)
      onSuccess()
    } catch (err) {
      setError(ERROR_MAP[err.status] ?? err.message ?? 'Erro ao solicitar acesso.')
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
        aria-labelledby="etpm-title"
      >
        <div
          className={styles.modalIcon}
          style={{ background: 'rgba(108,92,231,.1)', borderColor: 'rgba(108,92,231,.3)', color: 'var(--accent)' }}
        >
          <Icon name="lock" size={26} />
        </div>

        <h3 id="etpm-title" className={styles.modalTitle}>Entrar em trilha privada</h3>

        <p className={styles.modalDesc}>
          Informe o <strong>código de acesso</strong> fornecido pelo professor para entrar na trilha.
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
            <button
              type="submit"
              className={styles.confirmBtnEnable}
              disabled={loading || !codigo.trim()}
            >
              {loading ? 'Verificando…' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
