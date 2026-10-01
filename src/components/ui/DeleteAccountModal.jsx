import { useState } from 'react'
import Icon        from './Icon'
import { InputField } from './InputField'
import styles from './MfaSecuritySection.module.css' // reutiliza estilos do modal MFA
import pageStyles from '../../pages/TeacherConfiguracoesPage.module.css'

/**
 * Modal de exclusão de conta com suporte a MFA.
 *
 * Props:
 *  - mfaHabilitado: boolean
 *  - isGoogleUser:  boolean
 *  - onRequestChallenge: (senha) => Promise<void>   — envia código MFA
 *  - onConfirm:  (senha, codigoMfa?) => Promise<void>
 *  - onCancel:   () => void
 *  - roleLabel:  string  — ex: "conta", "trilhas e aulas"
 */
export default function DeleteAccountModal({
  mfaHabilitado,
  isGoogleUser,
  onRequestChallenge,
  onConfirm,
  onCancel,
  roleLabel = 'conta',
}) {
  // step: 'senha' | 'codigo'
  const [step,       setStep]       = useState('senha')
  const [senha,      setSenha]      = useState('')
  const [codigo,     setCodigo]     = useState('')
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [codeSent,   setCodeSent]   = useState(false)

  const needsMfa = mfaHabilitado && !isGoogleUser

  async function handleSenhaSubmit(e) {
    e.preventDefault()
    if (!senha) { setError('Informe sua senha atual.'); return }
    setError('')
    setLoading(true)
    try {
      if (needsMfa) {
        await onRequestChallenge(senha)
        setCodeSent(true)
        setStep('codigo')
      } else {
        await onConfirm(senha, null)
      }
    } catch (err) {
      setError(err.message || 'Erro ao processar solicitação.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCodigoSubmit(e) {
    e.preventDefault()
    if (!codigo) { setError('Informe o código recebido por e-mail.'); return }
    setError('')
    setLoading(true)
    try {
      await onConfirm(senha, codigo)
    } catch (err) {
      setError(err.message || 'Código inválido ou expirado.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError('')
    setLoading(true)
    try {
      await onRequestChallenge(senha)
      setCodeSent(true)
    } catch (err) {
      setError(err.message || 'Erro ao reenviar código.')
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
        aria-labelledby="delete-modal-title"
      >
        <div className={styles.modalIcon} style={{ background: 'rgba(239,68,68,.1)', borderColor: 'rgba(239,68,68,.3)', color: 'var(--danger)' }}>
          <Icon name="trash" size={26} />
        </div>

        <h3 id="delete-modal-title" className={styles.modalTitle}>
          {step === 'senha' ? 'Excluir conta' : 'Confirmar exclusão'}
        </h3>

        {step === 'senha' ? (
          <>
            <p className={styles.modalDesc}>
              {needsMfa
                ? 'Para excluir sua conta, confirme sua senha. Em seguida, enviaremos um código de verificação para o seu e-mail.'
                : `Esta ação é permanente. Todos os dados da sua ${roleLabel} serão removidos. Confirme sua senha para continuar.`}
            </p>
            <form onSubmit={handleSenhaSubmit} noValidate className={styles.modalForm}>
              <InputField
                id="delete-senha"
                label="Senha atual"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={e => { setSenha(e.target.value); setError('') }}
                error={error}
                disabled={loading}
                autoFocus
              />
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className={styles.confirmBtnDisable} disabled={loading}>
                  {loading ? 'Aguarde…' : needsMfa ? 'Enviar código' : 'Excluir conta'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className={styles.modalDesc}>
              Enviamos um código de 6 dígitos para o seu e-mail. Informe-o abaixo para confirmar a exclusão.
            </p>
            <form onSubmit={handleCodigoSubmit} noValidate className={styles.modalForm}>
              <InputField
                id="delete-codigo"
                label="Código de verificação"
                type="text"
                placeholder="000000"
                value={codigo}
                onChange={e => { setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                error={error}
                disabled={loading}
                autoFocus
              />
              {error && (
                <p className={pageStyles.errorMsg}>
                  <Icon name="alertCircle" size={13} /> {error}
                </p>
              )}
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className={styles.confirmBtnDisable} disabled={loading || codigo.length < 6}>
                  {loading ? 'Verificando…' : 'Excluir conta'}
                </button>
              </div>
            </form>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}
            >
              Reenviar código
            </button>
          </>
        )}
      </div>
    </div>
  )
}
