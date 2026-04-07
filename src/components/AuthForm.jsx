import { useState } from 'react'
import { Button } from './ui/Button'
import { InputField } from './ui/InputField'
import { ToggleForm } from './ui/ToggleForm'
import styles from './AuthForm.module.css'

// ── Frontend-only role resolution ─────────────────────────────────────────
// Replace this entire function with a backend response when auth is real.
// The backend should return { role } in the login/signup response.
const ACCESS_CODES = {
  ADMIN123:   'admin',
  TEACHER123: 'teacher',
}
function resolveRole(accessCode) {
  return ACCESS_CODES[accessCode?.trim().toUpperCase()] ?? 'student'
}

// ── Validation helpers ──────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateLogin({ email, password }) {
  const errors = {}
  if (!email)               errors.email    = 'Informe seu e-mail.'
  else if (!EMAIL_RE.test(email)) errors.email = 'E-mail inválido.'
  if (!password)            errors.password = 'Informe sua senha.'
  else if (password.length < 6)  errors.password = 'Mínimo de 6 caracteres.'
  return errors
}

function validateSignup({ name, email, password, confirm }) {
  const errors = {}
  if (!name)                      errors.name     = 'Informe seu nome.'
  if (!email)                     errors.email    = 'Informe seu e-mail.'
  else if (!EMAIL_RE.test(email)) errors.email    = 'E-mail inválido.'
  if (!password)                  errors.password = 'Informe uma senha.'
  else if (password.length < 6)   errors.password = 'Mínimo de 6 caracteres.'
  if (!confirm)                   errors.confirm  = 'Confirme sua senha.'
  else if (confirm !== password)  errors.confirm  = 'As senhas não coincidem.'
  return errors
}

// ── Component ───────────────────────────────────────────────────────────────

export default function AuthForm({ initialMode = 'login', onClose, onSuccess }) {
  const [mode, setMode]       = useState(initialMode)
  const [fields, setFields]   = useState({ name: '', email: '', password: '', confirm: '', accessCode: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setFields(f => ({ ...f, [name]: value }))
    // Clear the error for this field as the user types
    if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }))
  }

  function toggleMode() {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setErrors({})
    setFields({ name: '', email: '', password: '', confirm: '', accessCode: '' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = mode === 'login'
      ? validateLogin(fields)
      : validateSignup(fields)

    if (Object.keys(errs).length) { setErrors(errs); return }

    // Resolve role from access code — swap resolveRole() for backend response later
    const role = resolveRole(fields.accessCode)

    setLoading(true)
    try {
      // ── Backend integration point ──────────────────────────────────────
      // Replace with: const { role } = await api.post('/auth/login', payload)
      //               const { role } = await api.post('/auth/signup', payload)
      if (mode === 'login') {
        console.log('LOGIN →', { email: fields.email, password: fields.password, role })
      } else {
        console.log('SIGNUP →', { name: fields.name, email: fields.email, password: fields.password, role })
      }
      // Simulated delay — replace with real await api.post(...) later
      await new Promise(r => setTimeout(r, 900))
      if (onSuccess) onSuccess(mode, role, fields.name)
    } catch (err) {
      setErrors({ form: 'Algo deu errado. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  const isLogin = mode === 'login'

  return (
    /* Backdrop — click outside to close */
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">

        {/* Close button */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">✕</button>

        {/* Logo */}
        <div className={styles.logo}>
          <svg width="180" height="28" viewBox="0 0 180 28" fill="none">
            <text x="0"  y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#FFFFFF">Study</text>
            <text x="74" y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#6C5CE7">Connect</text>
          </svg>
        </div>

        <h2 className={styles.title}>{isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
        <p className={styles.sub}>{isLogin ? 'Entre para continuar estudando.' : 'É grátis e leva menos de 1 minuto.'}</p>

        {/* Role selector — both login and signup */}
        {/* REMOVED: role is now derived from the access code field below */}

        {/* Global form error (e.g. network failure) */}
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
            type="password" placeholder="Mínimo 6 caracteres"
            value={fields.password} onChange={handleChange}
            error={errors.password} autoComplete={isLogin ? 'current-password' : 'new-password'}
          />

          {!isLogin && (
            <InputField
              id="confirm" name="confirm" label="Confirmar senha"
              type="password" placeholder="Repita a senha"
              value={fields.confirm} onChange={handleChange}
              error={errors.confirm} autoComplete="new-password"
            />
          )}

          {/* Optional access code — determines role (frontend-only until backend is ready) */}
          <InputField
            id="accessCode" name="accessCode" label="Código de acesso (opcional)"
            type="text" placeholder="Deixe em branco para entrar como aluno"
            value={fields.accessCode} onChange={handleChange}
            error={errors.accessCode} autoComplete="off"
          />

          <Button variant="primary" type="submit" disabled={loading} className={styles.submitBtn}>
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
