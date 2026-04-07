import { useState } from 'react'
import { Button } from './ui/Button'
import { InputField } from './ui/InputField'
import { ToggleForm } from './ui/ToggleForm'
import styles from './AuthForm.module.css'

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

function validateSignup({ name, email, password, confirm }, role, teacherCode) {
  const errors = {}
  if (!name)                      errors.name    = 'Informe seu nome.'
  if (!email)                     errors.email   = 'Informe seu e-mail.'
  else if (!EMAIL_RE.test(email)) errors.email   = 'E-mail inválido.'
  if (!password)                  errors.password = 'Informe uma senha.'
  else if (password.length < 6)   errors.password = 'Mínimo de 6 caracteres.'
  if (!confirm)                   errors.confirm  = 'Confirme sua senha.'
  else if (confirm !== password)  errors.confirm  = 'As senhas não coincidem.'
  // Teacher-specific validation
  if (role === 'teacher' && !teacherCode.trim())
    errors.teacherCode = 'Informe o código de acesso.'
  return errors
}

// ── Component ───────────────────────────────────────────────────────────────

export default function AuthForm({ initialMode = 'login', onClose, onSuccess }) {
  const [mode, setMode]       = useState(initialMode)
  const [role, setRole]       = useState('student')  // 'student' | 'teacher'
  const [fields, setFields]   = useState({ name: '', email: '', password: '', confirm: '', teacherCode: '' })
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
    setRole('student')
    setErrors({})
    setFields({ name: '', email: '', password: '', confirm: '', teacherCode: '' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = mode === 'login'
      ? validateLogin(fields)
      : validateSignup(fields, role, fields.teacherCode)

    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      // ── Backend integration point ──────────────────────────────────────
      // Replace with: await api.post('/auth/login', payload)
      //               await api.post('/auth/signup', payload)
      if (mode === 'login') {
        const payload = { email: fields.email, password: fields.password, role }
        console.log('LOGIN →', payload)
      } else {
        const payload = {
          name:        fields.name,
          email:       fields.email,
          password:    fields.password,
          role,
          // Only sent when role === 'teacher'; backend should ignore for students
          ...(role === 'teacher' && { teacherCode: fields.teacherCode }),
        }
        console.log('SIGNUP →', payload)
      }
      // Simulated delay — replace with real await api.post(...) later
      await new Promise(r => setTimeout(r, 900))
      if (onSuccess) onSuccess(mode, role)
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
        <div className={styles.roleSelector} role="group" aria-label="Tipo de conta">
          <button
            type="button"
            className={`${styles.roleBtn} ${role === 'student' ? styles.roleBtnActive : ''}`}
            onClick={() => { setRole('student'); setErrors(e => ({ ...e, teacherCode: undefined })) }}
          >
            🎓 Aluno
          </button>
          <button
            type="button"
            className={`${styles.roleBtn} ${role === 'teacher' ? styles.roleBtnActive : ''}`}
            onClick={() => setRole('teacher')}
          >
            🏫 Professor
          </button>
        </div>

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

          {/* Teacher-only field — animated entrance via CSS */}
          {!isLogin && role === 'teacher' && (
            <div className={styles.teacherBlock}>
              <InputField
                id="teacherCode" name="teacherCode" label="Código de acesso do professor"
                type="text" placeholder="Digite o código de acesso"
                value={fields.teacherCode} onChange={handleChange}
                error={errors.teacherCode} autoComplete="off"
              />
              <p className={styles.teacherHint}>
                ⚠️ O cadastro como professor pode exigir validação pela instituição.
              </p>
            </div>
          )}

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
