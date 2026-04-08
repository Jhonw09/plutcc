import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui/Button'
import { InputField } from './ui/InputField'
import { ToggleForm } from './ui/ToggleForm'
import styles from './AuthForm.module.css'

// ── Validation helpers ──────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateLogin({ email, password }) {
  const errors = {}
  if (!email)                     errors.email    = 'Informe seu e-mail.'
  else if (!EMAIL_RE.test(email)) errors.email    = 'E-mail inválido.'
  if (!password)                  errors.password = 'Informe sua senha.'
  else if (password.length < 6)   errors.password = 'Mínimo de 6 caracteres.'
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
  const { login, signup } = useAuth()

  const [mode, setMode]       = useState(initialMode)
  const [role, setRole]       = useState('student')
  const [fields, setFields]   = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setFields(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }))
  }

  function toggleMode() {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setErrors({})
    setFields({ name: '', email: '', password: '', confirm: '' })
  }

  function handleRoleChange(r) {
    setRole(r)
    setErrors({})
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = mode === 'login'
      ? validateLogin(fields)
      : validateSignup(fields)

    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      if (mode === 'login') {
        await login({ email: fields.email, senha: fields.password })
      } else {
        const tipoUsuario = role === 'teacher' ? 'PROFESSOR' : 'ALUNO'
        await signup({ nome: fields.name, email: fields.email, senha: fields.password, tipoUsuario })
      }
      if (onSuccess) onSuccess(mode)
    } catch (err) {
      setErrors({ form: err.message ?? 'Algo deu errado. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  const isLogin = mode === 'login'

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">

        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">✕</button>

        <div className={styles.logo}>
          <svg width="180" height="28" viewBox="0 0 180 28" fill="none">
            <text x="0"  y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#FFFFFF">Study</text>
            <text x="74" y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#6C5CE7">Connect</text>
          </svg>
        </div>

        <h2 className={styles.title}>{isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
        <p className={styles.sub}>{isLogin ? 'Entre para continuar.' : 'É grátis e leva menos de 1 minuto.'}</p>

        <div className={styles.roleSelector} role="group" aria-label="Tipo de usuário">
          <button
            type="button"
            className={`${styles.roleBtn} ${role === 'student' ? styles.roleBtnActive : ''}`}
            onClick={() => handleRoleChange('student')}
          >
            🎓 Sou Aluno
          </button>
          <button
            type="button"
            className={`${styles.roleBtn} ${role === 'teacher' ? styles.roleBtnActive : ''}`}
            onClick={() => handleRoleChange('teacher')}
          >
            🏫 Sou Professor
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
