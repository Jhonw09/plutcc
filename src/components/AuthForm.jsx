import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPasswordChecks, isStrongPassword, isValidEmail } from '../utils/validation'
import { authService } from '../api/services/authService'
import { Button } from './ui/Button'
import { InputField } from './ui/InputField'
import { ToggleForm } from './ui/ToggleForm'
import styles from './AuthForm.module.css'

const RESEND_COOLDOWN = 30

function validateLogin({ email, password }) {
  const errors = {}
  if (!email) errors.email = 'Informe seu e-mail.'
  else if (!isValidEmail(email)) errors.email = 'E-mail invalido.'
  if (!password) errors.password = 'Informe sua senha.'
  return errors
}

function validateSignup({ name, email, password, confirm }) {
  const errors = {}
  if (!name) errors.name = 'Informe seu nome.'
  if (!email) errors.email = 'Informe seu e-mail.'
  else if (!isValidEmail(email)) errors.email = 'E-mail invalido.'
  if (!password) errors.password = 'Informe uma senha.'
  else if (!isStrongPassword(password)) errors.password = 'A senha ainda nao atende todos os requisitos.'
  if (!confirm) errors.confirm = 'Confirme sua senha.'
  else if (confirm !== password) errors.confirm = 'As senhas nao coincidem.'
  return errors
}

const Logo = () => (
  <div className={styles.logo}>
    <svg width="180" height="28" viewBox="0 0 180 28" fill="none">
      <text x="0" y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#FFFFFF">Study</text>
      <text x="74" y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#6C5CE7">Connect</text>
    </svg>
  </div>
)

export default function AuthForm({ initialMode = 'login', onClose, onSuccess }) {
  const { login, signup } = useAuth()

  const [mode, setMode] = useState(initialMode)
  const [role, setRole] = useState('student')
  const [fields, setFields] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // ── Forgot password ──────────────────────────────────────────
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')

  // ── Email verification ───────────────────────────────────────
  const [verifyEmail, setVerifyEmail] = useState('')
  const [verifyPassword, setVerifyPassword] = useState('')
  const [code, setCode] = useState('')
  const [cooldown, setCooldown] = useState(0)
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

  function startCooldown() { setCooldown(RESEND_COOLDOWN) }

  function handleChange(e) {
    const { name, value } = e.target
    setFields(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  function toggleMode() {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setErrors({})
    setFields({ name: '', email: '', password: '', confirm: '' })
  }

  function openForgot() {
    setForgotEmail(fields.email)
    setForgotSent(false)
    setErrors({})
    setMode('forgot')
  }

  // ── Forgot handlers ──────────────────────────────────────────
  async function handleForgotSubmit(e) {
    e.preventDefault()
    if (!forgotEmail || !isValidEmail(forgotEmail)) {
      setErrors({ forgotEmail: 'Informe um e-mail válido.' })
      return
    }
    setLoading(true)
    try {
      await authService.forgotPassword(forgotEmail)
      setForgotSent(true)
    } finally {
      setLoading(false)
    }
  }

  // ── Verify handlers ──────────────────────────────────────────
  async function handleVerifySubmit(e) {
    e.preventDefault()
    if (!code || code.length !== 6) {
      setErrors({ code: 'Insira o código de 6 dígitos.' })
      return
    }
    setLoading(true)
    try {
      await authService.verifyEmail(verifyEmail, code)
      await login({ email: verifyEmail, senha: verifyPassword })
      if (onSuccess) onSuccess('signup')
    } catch (err) {
      setErrors({ code: err.message ?? 'Código inválido.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0) return
    setLoading(true)
    try {
      await authService.resendVerification(verifyEmail)
      startCooldown()
      setErrors({})
    } catch (err) {
      setErrors({ code: err.message })
    } finally {
      setLoading(false)
    }
  }

  function handleChangeEmail() {
    setCode('')
    setErrors({})
    setMode('signup')
  }

  // ── Login / Signup handler ───────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    const errs = mode === 'login' ? validateLogin(fields) : validateSignup(fields)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      if (mode === 'login') {
        await login({ email: fields.email, senha: fields.password })
        if (onSuccess) onSuccess('login')
      } else {
        const tipoUsuario = role === 'teacher' ? 'PROFESSOR' : 'ALUNO'
        const { email } = await signup({ nome: fields.name, email: fields.email, senha: fields.password, tipoUsuario })
        setVerifyEmail(email)
        setVerifyPassword(fields.password)
        startCooldown()
        setErrors({})
        setMode('verify')
      }
    } catch (err) {
      setErrors({ form: err.message ?? 'Algo deu errado. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  const isLogin = mode === 'login'
  const passwordChecks = getPasswordChecks(fields.password)
  const passwordInvalid = !isLogin && fields.password && !isStrongPassword(fields.password)
  const submitDisabled = loading || Boolean(passwordInvalid)

  // ── Render: verify ───────────────────────────────────────────
  if (mode === 'verify') {
    return (
      <div className={styles.backdrop} onClick={onClose}>
        <div className={styles.card} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">x</button>
          <Logo />
          <h2 className={styles.title}>Verifique seu e-mail</h2>
          <p className={styles.sub}>
            Enviamos um código de 6 dígitos para <strong>{verifyEmail}</strong>. Insira abaixo para ativar sua conta.
          </p>

          {errors.code && <p className={styles.formError} role="alert">{errors.code}</p>}

          <form onSubmit={handleVerifySubmit} noValidate className={styles.form}>
            <InputField
              id="code" name="code" label="Código de verificação"
              type="text" placeholder="000000"
              value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setErrors({}) }}
              autoComplete="one-time-code"
              inputMode="numeric"
            />
            <Button variant="primary" type="submit" disabled={loading || code.length !== 6} className={styles.submitBtn}>
              {loading ? 'Verificando...' : 'Verificar'}
            </Button>
          </form>

          <div className={styles.verifyActions}>
            <button
              type="button"
              className={styles.resendBtn}
              onClick={handleResend}
              disabled={cooldown > 0 || loading}
            >
              {cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar código'}
            </button>
            <button type="button" className={styles.backLink} onClick={handleChangeEmail}>
              Alterar e-mail
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Render: forgot ───────────────────────────────────────────
  if (mode === 'forgot') {
    return (
      <div className={styles.backdrop} onClick={onClose}>
        <div className={styles.card} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">x</button>
          <Logo />
          <h2 className={styles.title}>Esqueceu a senha?</h2>

          {forgotSent ? (
            <>
              <p className={styles.sub}>
                Se o e-mail <strong>{forgotEmail}</strong> estiver cadastrado, você receberá as instruções em breve.
              </p>
              <Button variant="primary" className={styles.submitBtn} onClick={() => setMode('login')}>
                Voltar ao login
              </Button>
            </>
          ) : (
            <>
              <p className={styles.sub}>Informe seu e-mail para receber o link de redefinição.</p>
              {errors.forgotEmail && <p className={styles.formError} role="alert">{errors.forgotEmail}</p>}
              <form onSubmit={handleForgotSubmit} noValidate className={styles.form}>
                <InputField
                  id="forgotEmail" name="forgotEmail" label="E-mail"
                  type="email" placeholder="seu@email.com"
                  value={forgotEmail}
                  onChange={e => { setForgotEmail(e.target.value); setErrors({}) }}
                  error={errors.forgotEmail}
                />
                <Button variant="primary" type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? 'Enviando...' : 'Enviar link'}
                </Button>
              </form>
              <button type="button" className={styles.backLink} onClick={() => setMode('login')}>
                ← Voltar ao login
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Render: login / signup ───────────────────────────────────
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">

        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">x</button>
        <Logo />

        <h2 className={styles.title}>{isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
        <p className={styles.sub}>{isLogin ? 'Entre para continuar.' : 'E gratis e leva menos de 1 minuto.'}</p>

        <div className={styles.roleSelector} role="group" aria-label="Tipo de usuario">
          <button
            type="button"
            className={`${styles.roleBtn} ${role === 'student' ? styles.roleBtnActive : ''}`}
            onClick={() => { setRole('student'); setErrors({}) }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3.33 2 8.67 2 12 0v-5"/>
            </svg>
            Sou Aluno
          </button>
          <button
            type="button"
            className={`${styles.roleBtn} ${role === 'teacher' ? styles.roleBtnActive : ''}`}
            onClick={() => { setRole('teacher'); setErrors({}) }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
            Sou Professor
          </button>
        </div>

        {errors.form && <p className={styles.formError} role="alert">{errors.form}</p>}

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          {!isLogin && (
            <InputField
              id="name" name="name" label="Nome completo"
              type="text" placeholder="Seu nome"
              value={fields.name} onChange={handleChange}
              error={errors.name} autoComplete="name"
            />
          )}

          <InputField
            id="email" name="email" label="E-mail"
            type="email" placeholder="seu@email.com"
            value={fields.email} onChange={handleChange}
            error={errors.email} autoComplete="email"
          />

          <InputField
            id="password" name="password" label="Senha"
            type="password" placeholder={isLogin ? 'Sua senha' : 'Minimo 8 caracteres'}
            value={fields.password} onChange={handleChange}
            error={errors.password} autoComplete={isLogin ? 'current-password' : 'new-password'}
          />

          {isLogin && (
            <button type="button" className={styles.forgotLink} onClick={openForgot}>
              Esqueceu a senha?
            </button>
          )}

          {!isLogin && fields.password && (
            <ul className={styles.passwordRules} aria-live="polite">
              {passwordChecks.map(check => (
                <li key={check.id} className={check.valid ? styles.passwordRuleValid : styles.passwordRuleInvalid}>
                  <span aria-hidden="true">{check.valid ? 'OK' : '-'}</span>
                  {check.label}
                </li>
              ))}
            </ul>
          )}

          {!isLogin && (
            <InputField
              id="confirm" name="confirm" label="Confirmar senha"
              type="password" placeholder="Repita a senha"
              value={fields.confirm} onChange={handleChange}
              error={errors.confirm} autoComplete="new-password"
            />
          )}

          <Button variant="primary" type="submit" disabled={submitDisabled} className={styles.submitBtn}>
            {loading
              ? (isLogin ? 'Entrando...' : 'Criando conta...')
              : (isLogin ? 'Entrar' : 'Criar conta')
            }
          </Button>
        </form>

        <ToggleForm mode={mode} onToggle={toggleMode} />
      </div>
    </div>
  )
}
