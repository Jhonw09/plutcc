import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authService } from '../api/services/authService'
import { InputField } from '../components/ui/InputField'
import { Button } from '../components/ui/Button'
import { isStrongPassword, getPasswordChecks } from '../utils/validation'
import styles from './ResetPasswordPage.module.css'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const checks = getPasswordChecks(novaSenha)
  const senhaInvalid = novaSenha && !isStrongPassword(novaSenha)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isStrongPassword(novaSenha)) { setError('A senha não atende os requisitos.'); return }
    if (novaSenha !== confirmar) { setError('As senhas não coincidem.'); return }
    setError('')
    setLoading(true)
    try {
      await authService.resetPassword(token, novaSenha)
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <p className={styles.errorMsg}>Link inválido ou expirado.</p>
          <Button variant="primary" className={styles.btn} onClick={() => navigate('/')}>Voltar ao início</Button>
        </div>
      </div>
    )
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

        <h2 className={styles.title}>{done ? 'Senha redefinida!' : 'Criar nova senha'}</h2>

        {done ? (
          <>
            <p className={styles.sub}>Sua senha foi atualizada com sucesso. Faça login para continuar.</p>
            <Button variant="primary" className={styles.btn} onClick={() => navigate('/')}>Ir para o login</Button>
          </>
        ) : (
          <>
            <p className={styles.sub}>Escolha uma nova senha segura para sua conta.</p>
            {error && <p className={styles.errorMsg} role="alert">{error}</p>}
            <form onSubmit={handleSubmit} noValidate className={styles.form}>
              <InputField
                id="novaSenha" name="novaSenha" label="Nova senha"
                type="password" placeholder="Mínimo 8 caracteres"
                value={novaSenha} onChange={e => { setNovaSenha(e.target.value); setError('') }}
                autoComplete="new-password"
              />

              {novaSenha && (
                <ul className={styles.rules}>
                  {checks.map(c => (
                    <li key={c.id} className={c.valid ? styles.ruleOk : styles.ruleFail}>
                      <span>{c.valid ? 'OK' : '–'}</span>{c.label}
                    </li>
                  ))}
                </ul>
              )}

              <InputField
                id="confirmar" name="confirmar" label="Confirmar nova senha"
                type="password" placeholder="Repita a senha"
                value={confirmar} onChange={e => { setConfirmar(e.target.value); setError('') }}
                autoComplete="new-password"
              />

              <Button variant="primary" type="submit" disabled={loading || Boolean(senhaInvalid)} className={styles.btn}>
                {loading ? 'Salvando...' : 'Salvar nova senha'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
