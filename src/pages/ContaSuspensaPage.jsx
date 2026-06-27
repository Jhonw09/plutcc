import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { criarTicket } from '../api/services/ticketService'
import styles from './AuthPage.module.css'
import pageStyles from './ContaSuspensaPage.module.css'

const Logo = () => (
  <a href="/" className={styles.logoLink}>
    <svg width="180" height="28" viewBox="0 0 180 28" fill="none">
      <text x="0"  y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#FFFFFF">Study</text>
      <text x="74" y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#6C5CE7">Connect</text>
    </svg>
  </a>
)

export default function ContaSuspensaPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [msg,     setMsg]     = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (msg.trim().length < 10) return
    setLoading(true)
    try {
      await criarTicket({
        usuarioId: user?.id ?? null,
        nome:      user?.name ?? 'Usuário suspenso',
        email:     user?.email ?? '',
        tipo:      'Reativação de conta',
        mensagem:  msg,
      })
      setSent(true)
    } catch {
      // mostra sucesso mesmo se falhar — usuário não tem como agir
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${pageStyles.card}`}>
        <div className={styles.logo}><Logo /></div>

        <div className={pageStyles.iconWrap}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <h2 className={styles.title}>Conta suspensa</h2>
        <p className={styles.sub}>
          {user?.name ? `Olá, ${user.name}. A` : 'A'} sua conta foi temporariamente suspensa por um administrador da plataforma.
          Se acredita que isso foi um engano, envie uma mensagem abaixo.
        </p>

        {sent ? (
          <div className={pageStyles.successBox}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div>
              <p className={pageStyles.successTitle}>Mensagem enviada!</p>
              <p className={pageStyles.successSub}>
                Nossa equipe vai analisar e responder no e-mail <strong>{user?.email}</strong> em até 2 dias úteis.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className={styles.form}>
            <div className={styles.fieldWrap}>
              <label className={styles.fieldLabel}>Explique o ocorrido</label>
              <textarea
                className={pageStyles.textarea}
                placeholder="Descreva por que sua conta deve ser reativada..."
                value={msg}
                onChange={e => setMsg(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || msg.trim().length < 10}
            >
              {loading ? 'Enviando...' : 'Enviar para o suporte'}
            </button>
          </form>
        )}

        <button className={pageStyles.logoutBtn} onClick={handleLogout}>
          Sair da conta
        </button>
      </div>
    </div>
  )
}
