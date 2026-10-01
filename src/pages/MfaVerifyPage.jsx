import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../api/services/authService'
import { STORAGE_KEYS } from '../constants/storageKeys'
import { ROLE_ROUTES, DEFAULT_ROUTE } from '../constants/routes'
import { solicitacaoService } from '../api/services/solicitacaoService'
import styles from './AuthPage.module.css'

const RESEND_COOLDOWN = 60 // segundos

const Logo = () => (
  <a href="/" className={styles.logoLink}>
    <svg width="180" height="28" viewBox="0 0 180 28" fill="none">
      <text x="0"  y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#FFFFFF">Study</text>
      <text x="74" y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#6C5CE7">Connect</text>
    </svg>
  </a>
)

const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
)

export default function MfaVerifyPage() {
  const { mfaPending, verifyMfa, logout } = useAuth()
  const navigate = useNavigate()

  const [code,     setCode]     = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [resendLoading, setResendLoading] = useState(false)

  const email = sessionStorage.getItem(STORAGE_KEYS.mfaPendingEmail) ?? ''

  // Se não há MFA pendente, redireciona para login
  useEffect(() => {
    if (!mfaPending && !email) {
      navigate('/login', { replace: true })
    }
  }, [mfaPending, email, navigate])

  // Countdown do reenvio
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed || trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      setError('Informe um código de 6 dígitos.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const userData = await verifyMfa(trimmed)
      if (userData.ativo === false) { navigate('/conta-suspensa', { replace: true }); return }

      if (userData.role === 'student') {
        try {
          const lista = await solicitacaoService.minhas()
          const temPendente = (lista ?? []).some(s => s.status === 'PENDENTE')
          if (temPendente) { navigate('/aguardando-aprovacao', { replace: true }); return }
        } catch {
          // falha silenciosa
        }
      }

      navigate(ROLE_ROUTES[userData.role] ?? DEFAULT_ROUTE, { replace: true })
    } catch (err) {
      setError(err.message ?? 'Código inválido ou expirado.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resendLoading || !email) return
    setResendLoading(true)
    setError('')
    try {
      // Reenvio: faz uma nova chamada de login não é possível sem senha,
      // então o backend deve expor um endpoint de reenvio MFA.
      // Por ora, informa o usuário para voltar ao login e tentar novamente.
      // (endpoint de reenvio pode ser adicionado em iteração futura)
      setError('Para receber um novo código, volte ao login e entre novamente.')
    } finally {
      setResendLoading(false)
      setCooldown(RESEND_COOLDOWN)
    }
  }

  function handleCancel() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}><Logo /></div>

        <div className={styles.successIcon} style={{ background: 'rgba(108,92,231,.12)', border: '1px solid rgba(108,92,231,.25)', color: 'var(--accent)' }}>
          <ShieldIcon />
        </div>

        <h2 className={styles.title}>Verificação em duas etapas</h2>
        <p className={styles.sub}>
          Enviamos um código de 6 dígitos para o seu e-mail
          {email ? <> <strong>{email}</strong></> : ''}.
        </p>

        {error && <p className={styles.formError} role="alert">{error}</p>}

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <div className={styles.fieldWrap}>
            <label className={styles.fieldLabel}>Código</label>
            <div className={styles.fieldInner}>
              <input
                className={styles.fieldInput}
                style={{ paddingLeft: '14px', letterSpacing: '0.3em', fontSize: '20px', textAlign: 'center' }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError('') }}
                autoFocus
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Verificando...' : 'Verificar código'}
          </button>
        </form>

        <div className={styles.verifyActions}>
          <button
            className={styles.resendBtn}
            onClick={handleResend}
            disabled={cooldown > 0 || resendLoading}
          >
            {cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar código'}
          </button>
          <button className={styles.backLink} onClick={handleCancel}>
            ← Voltar ao login
          </button>
        </div>
      </div>
    </div>
  )
}
