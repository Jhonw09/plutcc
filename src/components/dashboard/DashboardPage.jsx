import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'
import { getTrilhasPublicas } from '../../api/services/trilhaService'
import styles from './DashboardPage.module.css'

const SUBJECT_EMOJI = {
  Matemática: '📐', Português: '📖', Química: '⚗️', Biologia: '🧬',
  Física: '⚡', Geografia: '🌍', História: '📜', Inglês: '🌐',
  Artes: '🎨', Informática: '💻', Filosofia: '🧠', Sociologia: '⚖️',
}

const NIVEL_COLOR = {
  Básico:        { color: '#22c55e', bg: 'rgba(34,197,94,.12)', border: 'rgba(34,197,94,.3)'  },
  Intermediário: { color: '#f59e0b', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)' },
  Avançado:      { color: '#ef4444', bg: 'rgba(239,68,68,.12)', border: 'rgba(239,68,68,.3)'  },
  BASICO:        { color: '#22c55e', bg: 'rgba(34,197,94,.12)', border: 'rgba(34,197,94,.3)'  },
  INTERMEDIARIO: { color: '#f59e0b', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)' },
  AVANCADO:      { color: '#ef4444', bg: 'rgba(239,68,68,.12)', border: 'rgba(239,68,68,.3)'  },
}

const MAX_RECOMENDADAS = 4

export default function DashboardPage() {
  const navigate = useNavigate()
  const [trilhas,  setTrilhas]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    getTrilhasPublicas()
      .then(data => setTrilhas(data.slice(0, MAX_RECOMENDADAS)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.heroEmpty}>
          <span className={styles.heroEmptyIcon}>⏳</span>
          <h3 className={styles.heroEmptyTitle}>Carregando...</h3>
        </div>
      </DashboardLayout>
    )
  }

  // Sem trilhas nenhuma → empty state puro
  if (!error && trilhas.length === 0) {
    return (
      <DashboardLayout>
        <div className={styles.heroEmpty}>
          <span className={styles.heroEmptyIcon}>📚</span>
          <h3 className={styles.heroEmptyTitle}>Você ainda não iniciou nenhuma trilha</h3>
          <p className={styles.heroEmptyDesc}>
            Explore as trilhas disponíveis e comece a aprender agora.
          </p>
          <button className={styles.heroEmptyBtn} onClick={() => navigate('/explorar')}>
            Explorar Trilhas
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className={styles.pageWrap}>

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Recomendadas para você</h1>
            <p className={styles.pageSub}>Algumas trilhas para começar. Veja todas em Explorar.</p>
          </div>
          <button
            className={styles.btnIniciar}
            onClick={() => navigate('/explorar')}
          >
            Ver todas →
          </button>
        </div>

        {error && (
          <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>
        )}

        <div className={styles.trilhasGrid}>
          {trilhas.map(trilha => {
            const nivel = NIVEL_COLOR[trilha.nivel] ?? NIVEL_COLOR['Básico']
            const emoji = SUBJECT_EMOJI[trilha.disciplina] ?? '📚'
            return (
              <div key={trilha.id} className={styles.trilhaCard}>
                <div className={styles.trilhaCardTop}>
                  <span className={styles.trilhaEmoji}>{emoji}</span>
                  <span
                    className={styles.trilhaNivel}
                    style={{ color: nivel.color, background: nivel.bg, borderColor: nivel.border }}
                  >
                    {trilha.nivel}
                  </span>
                </div>
                <h3 className={styles.trilhaNome}>{trilha.nome}</h3>
                {trilha.professorNome && (
                  <p className={styles.trilhaProf}>👨🏫 {trilha.professorNome}</p>
                )}
                {trilha.descricao && (
                  <p className={styles.trilhaDesc}>{trilha.descricao}</p>
                )}
                <div className={styles.trilhaFooter}>
                  <button
                    className={styles.btnIniciar}
                    onClick={() => navigate(`/dashboard/trilha/${trilha.id}`)}
                  >
                    Iniciar trilha →
                  </button>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </DashboardLayout>
  )
}
