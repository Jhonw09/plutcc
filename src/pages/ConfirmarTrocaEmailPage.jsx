import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../api/services/authService'
import styles from './AuthPage.module.css'

export default function ConfirmarTrocaEmailPage() {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const { user } = useAuth()
  const token = params.get('token')
  const [status, setStatus] = useState(token ? 'loading' : 'error') // loading | ok | error
  const [msg,    setMsg]    = useState(token ? '' : 'Link inválido.')

  useEffect(() => {
    if (!token) return

    authService.confirmEmailChange(token)
      .then(data => {
        setMsg(data?.emailNovo ?? '')
        setStatus('ok')
      })
      .catch(err => {
        setMsg(err.message || 'Link inválido ou expirado.')
        setStatus('error')
      })
  }, [token])

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
              Informe o código nas configurações para concluir a troca. A solicitação fica disponível por 15 minutos.
            </p>
            <button
              className={styles.submitBtn}
              onClick={() => navigate(user?.role === 'teacher'
                ? '/teacher-dashboard/editar-perfil'
                : user?.role === 'admin'
                  ? '/admin/configuracoes'
                  : user
                    ? '/dashboard/editar-perfil'
                    : '/login')}
            >
              {user ? 'Continuar para configurações' : 'Entrar para concluir'}
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
