import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../api/services/authService'
import { isValidEmail } from '../utils/validation'
import { ROLE_ROUTES, DEFAULT_ROUTE } from '../constants/routes'
import GoogleButton from '../components/ui/GoogleButton'
import styles from './AuthPage.module.css'

const BackButton = ({ onClick }) => (
  <button className={styles.backBtn} onClick={onClick} aria-label="Voltar">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
    Voltar
  </button>
)

const Logo = () => (
  <a href="/" className={styles.logoLink}>
    <svg width="180" height="28" viewBox="0 0 180 28" fill="none">
      <text x="0"  y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#FFFFFF">Study</text>
      <text x="74" y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#6C5CE7">Connect</text>
    </svg>
  </a>
)

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

export default function LoginPage() {
  const { user, login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Forgot password
  const [forgotMode,  setForgotMode]  = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent,  setForgotSent]  = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError,   setForgotError]   = useState('')

  if (user && user.ativo !== false) return <Navigate to={ROLE_ROUTES[user.role] ?? DEFAULT_ROUTE} replace />

  async function handleGoogleToken(idToken) {
    setGoogleLoading(true)
    try {
      const userData = await loginWithGoogle(idToken)
      if (userData.ativo === false) navigate('/conta-suspensa', { replace: true })
    } catch (err) {
      if (err.suspended) { navigate('/conta-suspensa', { replace: true }); return }
      setErrors({ form: err.message ?? 'Falha ao entrar com Google.' })
    } finally {
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!email)              errs.email    = 'Informe seu e-mail.'
    else if (!isValidEmail(email)) errs.email = 'E-mail inválido.'
    if (!password)           errs.password = 'Informe sua senha.'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const userData = await login({ email, senha: password })
      if (userData.ativo === false) navigate('/conta-suspensa', { replace: true })
    } catch (err) {
      if (err.suspended) { navigate('/conta-suspensa', { replace: true }); return }
      setErrors({ form: err.message ?? 'Algo deu errado. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotSubmit(e) {
    e.preventDefault()
    if (!forgotEmail || !isValidEmail(forgotEmail)) { setForgotError('Informe um e-mail válido.'); return }
    setForgotLoading(true)
    setForgotError('')
    try {
      await authService.forgotPassword(forgotEmail)
      setForgotSent(true)
    } finally {
      setForgotLoading(false)
    }
  }

  if (forgotMode) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <BackButton onClick={() => navigate(-1)} />
          <div className={styles.logo}><Logo /></div>
          <h2 className={styles.title}>Esqueceu a senha?</h2>

          {forgotSent ? (
            <>
              <div className={styles.successIcon}>📧</div>
              <p className={styles.sub}>
                Se <strong>{forgotEmail}</strong> estiver cadastrado, você receberá as instruções em breve.
              </p>
              <button className={styles.submitBtn} onClick={() => { setForgotMode(false); setForgotSent(false) }}>
                Voltar ao login
              </button>
            </>
          ) : (
            <>
              <p className={styles.sub}>Informe seu e-mail para receber o link de redefinição.</p>
              {forgotError && <p className={styles.formError}>{forgotError}</p>}
              <form onSubmit={handleForgotSubmit} noValidate className={styles.form}>
                <div className={styles.fieldWrap}>
                  <label className={styles.fieldLabel}>E-mail</label>
                  <div className={styles.fieldInner}>
                    <span className={styles.fieldIcon}><MailIcon /></span>
                    <input className={styles.fieldInput} type="email" placeholder="seu@email.com"
                      value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); setForgotError('') }}
                      autoComplete="email" />
                  </div>
                </div>
                <button type="submit" className={styles.submitBtn} disabled={forgotLoading}>
                  {forgotLoading ? 'Enviando...' : 'Enviar link'}
                </button>
              </form>
              <div className={styles.verifyActions}>
                <button className={styles.backLink} onClick={() => setForgotMode(false)}>← Voltar ao login</button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <BackButton onClick={() => navigate(-1)} />
        <div className={styles.logo}><Logo /></div>
        <h2 className={styles.title}>Bem-vindo de volta</h2>
        <p className={styles.sub}>Entre para continuar sua jornada.</p>

        <GoogleButton onToken={handleGoogleToken} loading={googleLoading} />

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>ou</span>
          <span className={styles.dividerLine} />
        </div>

        {errors.form && <p className={styles.formError} role="alert">{errors.form}</p>}

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <div className={styles.fieldWrap}>
            <label className={styles.fieldLabel}>E-mail</label>
            <div className={styles.fieldInner}>
              <span className={styles.fieldIcon}><MailIcon /></span>
              <input
                className={`${styles.fieldInput} ${errors.email ? styles.fieldInputError : ''}`}
                type="email" placeholder="seu@email.com"
                value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })) }}
                autoComplete="email" autoFocus
              />
            </div>
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          <div className={styles.fieldWrap}>
            <div className={styles.fieldLabelRow}>
              <label className={styles.fieldLabel}>Senha</label>
              <button type="button" className={styles.forgotLink} onClick={() => { setForgotEmail(email); setForgotMode(true) }}>
                Esqueceu a senha?
              </button>
            </div>
            <div className={styles.fieldInner}>
              <span className={styles.fieldIcon}><LockIcon /></span>
              <input
                className={`${styles.fieldInput} ${errors.password ? styles.fieldInputError : ''}`}
                type="password" placeholder="Sua senha"
                value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })) }}
                autoComplete="current-password"
              />
            </div>
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className={styles.switchRow}>
          Não tem conta?{' '}
          <button className={styles.switchLink} onClick={() => navigate('/cadastro')}>Criar conta grátis</button>
        </p>
      </div>
    </div>
  )
}
