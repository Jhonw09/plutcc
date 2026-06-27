import { useState, useEffect, useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../api/services/authService'
import { getPasswordChecks, isStrongPassword, isValidEmail } from '../utils/validation'
import { ROLE_ROUTES, DEFAULT_ROUTE } from '../constants/routes'
import GoogleButton from '../components/ui/GoogleButton'
import styles from './AuthPage.module.css'

const RESEND_COOLDOWN = 30

const Logo = () => (
  <a href="/" className={styles.logoLink}>
    <svg width="180" height="28" viewBox="0 0 180 28" fill="none">
      <text x="0"  y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#FFFFFF">Study</text>
      <text x="74" y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#6C5CE7">Connect</text>
    </svg>
  </a>
)

const BackButton = ({ onClick }) => (
  <button className={styles.backBtn} onClick={onClick} aria-label="Voltar">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
    Voltar
  </button>
)

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
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

export default function CadastroPage() {
  const { user, login, loginWithGoogle, signup } = useAuth()
  const navigate = useNavigate()

  const [role,   setRole]   = useState('student')
  const [fields, setFields] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Verificação de e-mail
  const [verifyMode,     setVerifyMode]     = useState(false)
  const [verifyEmail,    setVerifyEmail]    = useState('')
  const [verifyPassword, setVerifyPassword] = useState('')
  const [code,           setCode]           = useState('')
  const [cooldown,       setCooldown]       = useState(0)
  const [verifyLoading,  setVerifyLoading]  = useState(false)
  const [verifyError,    setVerifyError]    = useState('')
  const cooldownRef = useRef(null)

  useEffect(() => {
    if (cooldown <= 0) return
    cooldownRef.current = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) { clearInterval(cooldownRef.current); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(cooldownRef.current)
  }, [cooldown])

  if (user) return <Navigate to={ROLE_ROUTES[user.role] ?? DEFAULT_ROUTE} replace />

  async function handleGoogleToken(idToken) {
    setGoogleLoading(true)
    try {
      await loginWithGoogle(idToken)
    } catch (err) {
      setErrors({ form: err.message ?? 'Falha ao entrar com Google.' })
    } finally {
      setGoogleLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFields(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!fields.name.trim())          errs.name     = 'Informe seu nome.'
    if (!fields.email)                errs.email    = 'Informe seu e-mail.'
    else if (!isValidEmail(fields.email)) errs.email = 'E-mail inválido.'
    if (!fields.password)             errs.password = 'Informe uma senha.'
    else if (!isStrongPassword(fields.password)) errs.password = 'A senha não atende todos os requisitos.'
    if (!fields.confirm)              errs.confirm  = 'Confirme sua senha.'
    else if (fields.confirm !== fields.password) errs.confirm = 'As senhas não coincidem.'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const tipoUsuario = role === 'teacher' ? 'PROFESSOR' : 'ALUNO'
      const { email } = await signup({ nome: fields.name, email: fields.email, senha: fields.password, tipoUsuario })
      setVerifyEmail(email)
      setVerifyPassword(fields.password)
      setCooldown(RESEND_COOLDOWN)
      setVerifyMode(true)
    } catch (err) {
      setErrors({ form: err.message ?? 'Algo deu errado. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    if (!code || code.length !== 6) { setVerifyError('Insira o código de 6 dígitos.'); return }
    setVerifyLoading(true)
    setVerifyError('')
    try {
      await authService.verifyEmail(verifyEmail, code)
      await login({ email: verifyEmail, senha: verifyPassword })
    } catch (err) {
      setVerifyError(err.message ?? 'Código inválido.')
    } finally {
      setVerifyLoading(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0) return
    try {
      await authService.resendVerification(verifyEmail)
      setCooldown(RESEND_COOLDOWN)
      setVerifyError('')
    } catch (err) {
      setVerifyError(err.message)
    }
  }

  const checks = getPasswordChecks(fields.password)
  const passwordInvalid = fields.password && !isStrongPassword(fields.password)

  // ── Tela de verificação ──────────────────────────────────────────
  if (verifyMode) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <BackButton onClick={() => navigate(-1)} />
          <div className={styles.logo}><Logo /></div>
          <h2 className={styles.title}>Verifique seu e-mail</h2>
          <p className={styles.sub}>
            Enviamos um código de 6 dígitos para <strong>{verifyEmail}</strong>.
          </p>

          {verifyError && <p className={styles.formError} role="alert">{verifyError}</p>}

          <form onSubmit={handleVerify} noValidate className={styles.form}>
            <div className={styles.fieldWrap}>
              <label className={styles.fieldLabel}>Código de verificação</label>
              <div className={styles.fieldInner}>
                <span className={styles.fieldIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  className={styles.fieldInput}
                  type="text" placeholder="000000" inputMode="numeric"
                  value={code}
                  onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setVerifyError('') }}
                  autoComplete="one-time-code" autoFocus
                />
              </div>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={verifyLoading || code.length !== 6}>
              {verifyLoading ? 'Verificando...' : 'Verificar e entrar'}
            </button>
          </form>

          <div className={styles.verifyActions}>
            <button className={styles.resendBtn} onClick={handleResend} disabled={cooldown > 0}>
              {cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar código'}
            </button>
            <button className={styles.backLink} onClick={() => setVerifyMode(false)}>
              Alterar e-mail
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Formulário de cadastro ───────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <BackButton onClick={() => navigate(-1)} />
        <div className={styles.logo}><Logo /></div>
        <h2 className={styles.title}>Crie sua conta</h2>
        <p className={styles.sub}>Grátis e leva menos de 1 minuto.</p>

        <GoogleButton onToken={handleGoogleToken} loading={googleLoading} />

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>ou cadastre com e-mail</span>
          <span className={styles.dividerLine} />
        </div>

        <div className={styles.roleSelector}>
          <button type="button"
            className={`${styles.roleBtn} ${role === 'student' ? styles.roleBtnActive : ''}`}
            onClick={() => setRole('student')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3.33 2 8.67 2 12 0v-5"/>
            </svg>
            Sou Aluno
          </button>
          <button type="button"
            className={`${styles.roleBtn} ${role === 'teacher' ? styles.roleBtnActive : ''}`}
            onClick={() => setRole('teacher')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
            Sou Professor
          </button>
        </div>

        {errors.form && <p className={styles.formError} role="alert">{errors.form}</p>}

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <div className={styles.fieldWrap}>
            <label className={styles.fieldLabel}>Nome completo</label>
            <div className={styles.fieldInner}>
              <span className={styles.fieldIcon}><UserIcon /></span>
              <input className={`${styles.fieldInput} ${errors.name ? styles.fieldInputError : ''}`}
                type="text" name="name" placeholder="Seu nome"
                value={fields.name} onChange={handleChange} autoComplete="name" autoFocus />
            </div>
            {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
          </div>

          <div className={styles.fieldWrap}>
            <label className={styles.fieldLabel}>E-mail</label>
            <div className={styles.fieldInner}>
              <span className={styles.fieldIcon}><MailIcon /></span>
              <input className={`${styles.fieldInput} ${errors.email ? styles.fieldInputError : ''}`}
                type="email" name="email" placeholder="seu@email.com"
                value={fields.email} onChange={handleChange} autoComplete="email" />
            </div>
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          <div className={styles.fieldWrap}>
            <label className={styles.fieldLabel}>Senha</label>
            <div className={styles.fieldInner}>
              <span className={styles.fieldIcon}><LockIcon /></span>
              <input className={`${styles.fieldInput} ${errors.password ? styles.fieldInputError : ''}`}
                type="password" name="password" placeholder="Mínimo 8 caracteres"
                value={fields.password} onChange={handleChange} autoComplete="new-password" />
            </div>
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
            {fields.password && (
              <ul className={styles.passwordRules}>
                {checks.map(c => (
                  <li key={c.id} className={c.valid ? styles.ruleOk : styles.ruleFail}>
                    <span>{c.valid ? '✓' : '–'}</span>{c.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.fieldWrap}>
            <label className={styles.fieldLabel}>Confirmar senha</label>
            <div className={styles.fieldInner}>
              <span className={styles.fieldIcon}><LockIcon /></span>
              <input className={`${styles.fieldInput} ${errors.confirm ? styles.fieldInputError : ''}`}
                type="password" name="confirm" placeholder="Repita a senha"
                value={fields.confirm} onChange={handleChange} autoComplete="new-password" />
            </div>
            {errors.confirm && <span className={styles.fieldError}>{errors.confirm}</span>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading || Boolean(passwordInvalid)}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className={styles.switchRow}>
          Já tem conta?{' '}
          <button className={styles.switchLink} onClick={() => navigate('/login')}>Entrar</button>
        </p>
      </div>
    </div>
  )
}
