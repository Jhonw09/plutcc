import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../api/services/authService'
import { isValidEmail } from '../utils/validation'
import { Button } from '../components/ui/Button'
import { InputField } from '../components/ui/InputField'
import styles from './ResetPasswordPage.module.css'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail]   = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !isValidEmail(email)) { setError('Informe um e-mail válido.'); return }
    setError('')
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg width="180" height="28" viewBox="0 0 180 28" fill="none">
            <text x="0" y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#FFFFFF">Study</text>
            <text x="74" y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#6C5CE7">Connect</text>
          </svg>
        </div>

        <h2 className={styles.title}>{sent ? 'E-mail enviado!' : 'Esqueceu sua senha?'}</h2>

        {sent ? (
          <>
            <p className={styles.sub}>
              Se <strong>{email}</strong> estiver cadastrado, você receberá as instruções para redefinir sua senha em breve.
            </p>
            <Button variant="primary" className={styles.btn} onClick={() => navigate(-1)}>
              Voltar
            </Button>
          </>
        ) : (
          <>
            <p className={styles.sub}>Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>
            {error && <p className={styles.errorMsg} role="alert">{error}</p>}
            <form onSubmit={handleSubmit} noValidate className={styles.form}>
              <InputField
                id="email" name="email" label="E-mail"
                type="email" placeholder="seu@email.com"
                value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                autoComplete="email"
              />
              <Button variant="primary" type="submit" disabled={loading} className={styles.btn}>
                {loading ? 'Enviando...' : 'Enviar link de redefinição'}
              </Button>
            </form>
            <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
              ← Voltar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
