import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authService } from '../api/services/authService'
import styles from './AuthPage.module.css'

export default function ConfirmarTrocaEmailPage() {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const [status, setStatus] = useState('loading') // loading | ok | error
  const [msg,    setMsg]    = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) { setStatus('error'); setMsg('Link inválido.'); return }

    authService.confirmEmailChange(token)
      .then(data => {
        setMsg(data?.emailNovo ?? '')
        setStatus('ok')
      })
      .catch(err => {
        setMsg(err.message || 'Link inválido ou expirado.')
        setStatus('error')
      })
  }, [params])

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {status === 'loading' && (
          <>
            <h2 className={styles.title}>Verificando...</h2>
            <p className={styles.sub}>Aguarde um momento.</p>
          </>
        )}

        {status === 'ok' && (
          <>
            <div className={styles.successIcon}>✉️</div>
            <h2 className={styles.title}>Quase lá!</h2>
            <p className={styles.sub}>
              Enviamos um código de verificação para <strong>{msg}</strong>.<br />
              Acesse sua conta e insira o código para concluir a troca.
            </p>
            <button className={styles.submitBtn} onClick={() => navigate(-1)}>
              Voltar
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className={styles.title}>Link inválido</h2>
            <p className={styles.sub}>{msg}</p>
            <button className={styles.submitBtn} onClick={() => navigate('/')}>
              Ir para o início
            </button>
          </>
        )}
      </div>
    </div>
  )
}
