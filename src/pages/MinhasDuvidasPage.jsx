import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { api, ENDPOINTS } from '../api/apiClient'
import Icon from '../components/ui/Icon'
import styles from './MinhasDuvidasPage.module.css'

async function getDuvidasAluno(alunoId) {
  return api(`${ENDPOINTS.duvidas}?alunoId=${alunoId}`).catch(() => [])
}

export default function MinhasDuvidasPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [duvidas, setDuvidas]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filtro, setFiltro]     = useState('todas')

  useEffect(() => {
    if (!user?.id) return
    getDuvidasAluno(user.id).then(data => {
      setDuvidas(data ?? [])
      setLoading(false)
    })
  }, [user?.id])

  const visiveis = filtro === 'todas'
    ? duvidas
    : filtro === 'respondidas'
      ? duvidas.filter(d => d.resposta)
      : duvidas.filter(d => !d.resposta)

  const totalRespondidas = duvidas.filter(d => d.resposta).length
  const totalPendentes   = duvidas.filter(d => !d.resposta).length

  return (
    <DashboardLayout>
      <div className={styles.page}>

        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.pageTitle}>Minhas dúvidas</h1>
            <p className={styles.pageSub}>Acompanhe as respostas dos professores às suas dúvidas.</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.stats}>
            <span className={styles.statItem}>
              <span className={styles.statNum}>{totalPendentes}</span> aguardando
            </span>
            <span className={styles.statDot}>·</span>
            <span className={styles.statItem}>
              <span className={`${styles.statNum} ${styles.statGreen}`}>{totalRespondidas}</span> respondida{totalRespondidas !== 1 ? 's' : ''}
            </span>
            <span className={styles.statDot}>·</span>
            <span className={styles.statItem}>
              <span className={styles.statNum}>{duvidas.length}</span> total
            </span>
          </div>
          <div className={styles.filters}>
            {['todas', 'respondidas', 'pendentes'].map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filtro === f ? styles.filterActive : ''}`}
                onClick={() => setFiltro(f)}
              >
                {{ todas: 'Todas', respondidas: 'Respondidas', pendentes: 'Aguardando' }[f]}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className={styles.empty}>
            <Icon name="hourglass" size={28} style={{ opacity: .3 }} />
            <p>Carregando...</p>
          </div>
        )}

        {!loading && visiveis.length === 0 && (
          <div className={styles.empty}>
            <Icon name="inbox" size={32} style={{ opacity: .25 }} />
            <p>{filtro === 'todas' ? 'Você ainda não enviou nenhuma dúvida.' : 'Nenhuma dúvida nesta categoria.'}</p>
          </div>
        )}

        <div className={styles.list}>
          {visiveis.map(d => (
            <div key={d.id} className={`${styles.card} ${d.resposta ? styles.cardRespondida : ''}`}>

              <div className={styles.cardTop}>
                <div className={styles.aulaInfo}>
                  <Icon name="bookOpen" size={13} />
                  <span className={styles.aulaNome}>{d.aulaTitulo}</span>
                  <span className={styles.dot}>·</span>
                  <span className={styles.trilhaNome}>{d.trilhaId}</span>
                </div>
                <div className={styles.cardMeta}>
                  <span className={styles.time}>
                    <Icon name="clock" size={11} />
                    {new Date(d.criadaEm).toLocaleDateString('pt-BR')}
                  </span>
                  <span className={d.resposta ? styles.badgeRespondida : styles.badgePendente}>
                    {d.resposta ? 'Respondida' : 'Aguardando'}
                  </span>
                </div>
              </div>

              <p className={styles.mensagem}>{d.mensagem}</p>

              {d.resposta ? (
                <div className={styles.respostaBox}>
                  <div className={styles.respostaLabel}>
                    <Icon name="checkCircle" size={13} /> Resposta do professor
                  </div>
                  <p className={styles.respostaText}>{d.resposta}</p>
                </div>
              ) : (
                <div className={styles.aguardando}>
                  <Icon name="clock" size={13} />
                  Aguardando resposta do professor...
                </div>
              )}

              <button
                className={styles.btnIr}
                onClick={() => navigate(`/dashboard/trilha/${d.trilhaId}`)}
              >
                <Icon name="arrow" size={13} /> Ir para a aula
              </button>

            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  )
}
