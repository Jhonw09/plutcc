import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { solicitacaoService } from '../api/services/solicitacaoService'
import { ROLE_ROUTES } from '../constants/routes'
import styles from './AuthPage.module.css'

const POLL_INTERVAL_MS = 30_000

const Logo = () => (
  <a href="/" className={styles.logoLink}>
    <svg width="180" height="28" viewBox="0 0 180 28" fill="none">
      <text x="0"  y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#FFFFFF">Study</text>
      <text x="74" y="22" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="24" fill="#6C5CE7">Connect</text>
    </svg>
  </a>
)

export default function AguardandoAprovacaoPage() {
  const { logout, login, user } = useAuth()
  const navigate = useNavigate()
  const [reprovado, setReprovado] = useState(null) // { motivo } | null

  const verificarStatus = useCallback(async () => {
    try {
      const lista = await solicitacaoService.minhas()
      if (!lista?.length) return

      const aprovada  = lista.find(s => s.status === 'APROVADO')
      const reprovada = lista.find(s => s.status === 'REPROVADO')

      if (aprovada) {
        // Backend já promoveu o usuário para PROFESSOR.
        // O JWT atual ainda é de ALUNO — precisamos de novo login para obter JWT atualizado.
        // Fazemos logout e redirecionamos para /login com mensagem.
        logout()
        navigate('/login', {
          replace: true,
          state: { mensagem: 'Sua solicitação foi aprovada! Faça login para acessar o painel de professor.' },
        })
        return
      }

      if (reprovada) {
        setReprovado({ motivo: reprovada.motivoReprovacao ?? null })
      }
    } catch {
      // falha silenciosa — não interrompe o fluxo
    }
  }, [logout, navigate])

  // Verifica ao montar
  useEffect(() => { verificarStatus() }, [verificarStatus])

  // Polling a cada 30s
  useEffect(() => {
    const id = setInterval(verificarStatus, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [verificarStatus])

  // Verifica ao voltar ao foco da aba
  useEffect(() => {
    function onFocus() { verificarStatus() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [verificarStatus])

  function handleVoltarInicio() {
    logout()
    window.location.replace('/')
  }

  if (reprovado !== null) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}><Logo /></div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>

          <h2 className={styles.title}>Solicitação não aprovada</h2>

          <p className={styles.sub}>
            Infelizmente sua solicitação para cadastro como professor não foi aprovada.
          </p>

          {reprovado.motivo && (
            <p className={styles.sub} style={{ marginTop: '8px', background: 'rgba(220,38,38,.08)', border: '1px solid rgba(220,38,38,.2)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px' }}>
              <strong>Motivo:</strong> {reprovado.motivo}
            </p>
          )}

          <p className={styles.sub} style={{ marginTop: '8px' }}>
            Sua conta permanece ativa como aluno.
          </p>

          <button className={styles.submitBtn} onClick={handleVoltarInicio}>
            Voltar para a página inicial
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}><Logo /></div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>

        <h2 className={styles.title}>Sua solicitação está em análise</h2>

        <p className={styles.sub}>
          Recebemos sua solicitação para cadastro como professor.
        </p>
        <p className={styles.sub} style={{ marginTop: '8px' }}>
          Aguarde as próximas 24 horas para que nossa equipe verifique seus dados.
        </p>
        <p className={styles.sub} style={{ marginTop: '8px' }}>
          Você poderá retornar ao StudyConnect quando a análise for concluída.
        </p>

        <button className={styles.submitBtn} onClick={handleVoltarInicio}>
          Voltar para a página inicial
        </button>
      </div>
    </div>
  )
}
