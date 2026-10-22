import { useCallback, useEffect, useRef, useState } from 'react'
import Icon        from './Icon'
import { InputField } from './InputField'
import styles from './MfaSecuritySection.module.css' // reutiliza estilos do modal MFA
import pageStyles from '../../pages/TeacherConfiguracoesPage.module.css'
import { requestFreshGoogleIdToken } from '../../api/googleIdentity'

/**
 * Modal de exclusão de conta com suporte a MFA.
 *
 * Props:
 *  - mfaHabilitado: boolean
 *  - isGoogleUser:  boolean
 *  - onRequestChallenge: (senha?) => Promise<void>  — envia código de confirmação
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
  onLoadMethods,
  roleLabel = 'conta',
  title = 'Excluir conta',
  passwordLabel = 'Senha atual',
  passwordDescription,
  mfaDescription,
  confirmLabel = 'Excluir conta',
}) {
  // Self-service uses server-reported methods; the legacy path remains for admin user management.
  const [step,       setStep]       = useState(onLoadMethods ? 'loading-methods' : 'senha')
  const [senha,      setSenha]      = useState('')
  const [codigo,     setCodigo]     = useState('')
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [methods,    setMethods]    = useState(null)
  const [proof,      setProof]      = useState(null)
  const mountedRef = useRef(true)

  const needsMfa = mfaHabilitado && !isGoogleUser
  const needsCode = needsMfa || isGoogleUser

  const loadSelfMethods = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await onLoadMethods()
      if (!result?.hasPassword && !result?.hasGoogle) {
        throw new Error('Esta conta não possui um método de confirmação disponível.')
      }
      if (!mountedRef.current) return
      setMethods(result)
      setStep('choice')
    } catch (err) {
      if (!mountedRef.current) return
      setError(err.message || 'Não foi possível identificar os métodos desta conta.')
      setStep('load-error')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [onLoadMethods])

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (onLoadMethods) void loadSelfMethods()
  }, [loadSelfMethods, onLoadMethods])

  async function submitSelfProof(identityProof) {
    setLoading(true)
    setError('')
    try {
      const result = await onRequestChallenge(identityProof)
      if (!mountedRef.current) return
      setProof(identityProof)
      setStep(result?.mfaRequired === true ? 'codigo' : 'confirm')
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Não foi possível confirmar sua identidade.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  async function handleSelfGoogle() {
    setLoading(true)
    setError('')
    try {
      const googleIdToken = await requestFreshGoogleIdToken()
      if (!mountedRef.current) return
      setCodigo('')
      const identityProof = { googleIdToken }
      const result = await onRequestChallenge(identityProof)
      if (!mountedRef.current) return
      setProof(identityProof)
      setStep(result?.mfaRequired === true ? 'codigo' : 'confirm')
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Não foi possível confirmar sua identidade com o Google.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  async function handleSelfCodeSubmit(e) {
    e.preventDefault()
    if (!/^\d{6}$/.test(codigo)) {
      setError('Informe o código de 6 dígitos recebido por e-mail.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onConfirm(proof, codigo)
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Código inválido ou expirado.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  async function handleSelfConfirm() {
    setLoading(true)
    setError('')
    try {
      await onConfirm(proof, null)
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Não foi possível excluir a conta.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  async function handleSenhaSubmit(e) {
    e.preventDefault()
    if (!isGoogleUser && !senha) { setError('Informe sua senha atual.'); return }
    setError('')
    setLoading(true)
    try {
      if (needsCode) {
        await onRequestChallenge(isGoogleUser ? null : senha)
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
    if (codigo.length !== 6) { setError('Informe o código de 6 dígitos recebido por e-mail.'); return }
    setError('')
    setLoading(true)
    try {
      await onConfirm(isGoogleUser ? null : senha, codigo)
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
      await onRequestChallenge(isGoogleUser ? null : senha)
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
          {onLoadMethods
            ? step === 'codigo' ? 'Verificação de segurança' : step === 'confirm' ? 'Confirme a exclusão' : title
            : step === 'senha' ? title : 'Confirmar exclusão'}
        </h3>

        {onLoadMethods ? (
          <>
            {step === 'loading-methods' && (
              <p className={styles.modalDesc}>Identificando os métodos de autenticação da sua conta...</p>
            )}
            {step === 'load-error' && (
              <>
                <p className={pageStyles.errorMsg} role="alert">{error}</p>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={onCancel}>Cancelar</button>
                  <button type="button" className={styles.confirmBtnDisable} onClick={loadSelfMethods} disabled={loading}>
                    {loading ? 'Aguarde…' : 'Tentar novamente'}
                  </button>
                </div>
              </>
            )}
            {step === 'choice' && (
              <>
                <p className={styles.modalDesc}>
                  Confirme sua identidade com um método vinculado à conta. Se o MFA estiver habilitado, também será solicitado um código por e-mail.
                </p>
                {methods?.hasPassword && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (!senha) { setError('Informe sua senha atual.'); return }
                      void submitSelfProof({ senha })
                    }}
                    noValidate
                    className={styles.modalForm}
                  >
                    <InputField
                      id="delete-senha"
                      label={passwordLabel}
                      type="password"
                      placeholder="••••••••"
                      value={senha}
                      onChange={e => { setSenha(e.target.value); setError('') }}
                      error={error}
                      disabled={loading}
                      autoFocus
                    />
                    <button type="submit" className={styles.confirmBtnDisable} disabled={loading || !senha}>
                      {loading ? 'Aguarde…' : 'Continuar com senha'}
                    </button>
                  </form>
                )}
                {methods?.hasGoogle && (
                  <button
                    type="button"
                    className={styles.confirmBtnDisable}
                    onClick={handleSelfGoogle}
                    disabled={loading}
                    style={{ width: '100%', marginTop: 12 }}
                  >
                    {loading ? 'Aguarde…' : 'Confirmar com Google'}
                  </button>
                )}
                {error && <p className={pageStyles.errorMsg} role="alert">{error}</p>}
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={loading}>Cancelar</button>
                </div>
              </>
            )}
            {step === 'codigo' && (
              <>
                <p className={styles.modalDesc}>
                  {mfaDescription || 'Enviamos um código de 6 dígitos para o e-mail da sua conta. Informe-o para continuar.'}
                </p>
                <form onSubmit={handleSelfCodeSubmit} noValidate className={styles.modalForm}>
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
                  {error && <p className={pageStyles.errorMsg} role="alert">{error}</p>}
                  <div className={styles.modalActions}>
                    <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={loading}>Cancelar</button>
                    <button type="submit" className={styles.confirmBtnDisable} disabled={loading || codigo.length !== 6}>
                      {loading ? 'Verificando…' : 'Continuar'}
                    </button>
                  </div>
                </form>
                {proof?.googleIdToken && (
                  <button
                    type="button"
                    onClick={handleSelfGoogle}
                    disabled={loading}
                    style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}
                  >
                    Reautenticar com Google e reenviar código
                  </button>
                )}
                {proof?.senha && (
                  <button
                    type="button"
                    onClick={() => void submitSelfProof(proof)}
                    disabled={loading}
                    style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}
                  >
                    Reenviar código
                  </button>
                )}
              </>
            )}
            {step === 'confirm' && (
              <>
                <p className={styles.modalDesc}>
                  Sua identidade foi confirmada. A exclusão é permanente e remove sua conta e seus dados.
                </p>
                {error && <p className={pageStyles.errorMsg} role="alert">{error}</p>}
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={loading}>Cancelar</button>
                  {proof?.googleIdToken && (
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={() => { setProof(null); setCodigo(''); setError(''); setStep('choice') }}
                      disabled={loading}
                    >
                      Confirmar Google novamente
                    </button>
                  )}
                  <button type="button" className={styles.confirmBtnDisable} onClick={handleSelfConfirm} disabled={loading}>
                    {loading ? 'Excluindo…' : 'Excluir minha conta'}
                  </button>
                </div>
              </>
            )}
          </>
        ) : step === 'senha' ? (
          <>
            <p className={styles.modalDesc}>
              {needsMfa
                ? passwordDescription || 'Para excluir sua conta, confirme sua senha. Em seguida, enviaremos um código de verificação para o seu e-mail.'
                : isGoogleUser
                  ? passwordDescription || 'Para confirmar a exclusão da sua conta Google, enviaremos um código de verificação para o seu e-mail.'
                : passwordDescription || `Esta ação é permanente. Todos os dados da sua ${roleLabel} serão removidos. Confirme sua senha para continuar.`}
            </p>
            <form onSubmit={handleSenhaSubmit} noValidate className={styles.modalForm}>
              {!isGoogleUser && (
                <InputField
                  id="delete-senha"
                  label={passwordLabel}
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={e => { setSenha(e.target.value); setError('') }}
                  error={error}
                  disabled={loading}
                  autoFocus
                />
              )}
              {isGoogleUser && error && (
                <p className={pageStyles.errorMsg}>
                  <Icon name="alertCircle" size={13} /> {error}
                </p>
              )}
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className={styles.confirmBtnDisable} disabled={loading}>
                  {loading ? 'Aguarde…' : needsCode ? 'Enviar código' : 'Excluir conta'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className={styles.modalDesc}>
              {mfaDescription || 'Enviamos um código de 6 dígitos para o seu e-mail. Informe-o abaixo para confirmar a exclusão.'}
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
                  {loading ? 'Verificando…' : confirmLabel}
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
