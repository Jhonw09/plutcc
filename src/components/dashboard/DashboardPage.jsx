import { useNavigate } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'
import { useTrilhas } from '../../hooks/useTrilhas'
import { MOCK_TRILHAS } from '../../data/mockTrilhas'
import styles from './DashboardPage.module.css'

const SUBJECT_EMOJI = {
  Matemática: '📐', Português: '📖', Química: '⚗️', Biologia: '🧬',
  Física: '⚡', Geografia: '🌍', História: '📜', Inglês: '🌐',
  Artes: '🎨', Informática: '💻', Filosofia: '🧠', Sociologia: '⚖️',
}

const NIVEL_COLOR = {
  Básico:        { color: '#22c55e', bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.3)'  },
  Intermediário: { color: '#f59e0b', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)' },
  Avançado:      { color: '#ef4444', bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.3)'  },
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { trilhas: apiTrilhas, loading } = useTrilhas()

  const trilhas = (!loading && apiTrilhas.length > 0) ? apiTrilhas : MOCK_TRILHAS

  function handleIniciar(trilha) {
    navigate(`/dashboard/trilha/${trilha.id}`)
  }

  return (
    <DashboardLayout>
      {loading ? (
        <div className={styles.heroEmpty}>
          <span className={styles.heroEmptyIcon}>⏳</span>
          <h3 className={styles.heroEmptyTitle}>Carregando trilhas...</h3>
        </div>
      ) : (
        <div className={styles.pageWrap}>

          {/* ── Cabeçalho da página ── */}
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Minhas Trilhas</h1>
              <p className={styles.pageSub}>Escolha uma trilha abaixo e comece a estudar agora.</p>
            </div>
            <span className={styles.pageCount}>{trilhas.length} trilha{trilhas.length !== 1 ? 's' : ''} disponíve{trilhas.length !== 1 ? 'is' : 'l'}</span>
          </div>

          {/* ── Grid de trilhas ── */}
          <div className={styles.trilhasGrid}>
            {trilhas.map(trilha => {
              const nivel = NIVEL_COLOR[trilha.nivel] ?? NIVEL_COLOR['Básico']
              const emoji = SUBJECT_EMOJI[trilha.disciplina] ?? '📚'
              const total = trilha.exercicios?.length ?? 0

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
                  <p className={styles.trilhaProf}>👨🏫 {trilha.professorNome}</p>

                  {trilha.descricao && (
                    <p className={styles.trilhaDesc}>{trilha.descricao}</p>
                  )}

                  <div className={styles.trilhaFooter}>
                    <span className={styles.trilhaExCount}>
                      📝 {total} exercício{total !== 1 ? 's' : ''}
                    </span>
                    <button
                      className={styles.btnIniciar}
                      onClick={() => handleIniciar(trilha)}
                    >
                      Iniciar trilha →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      )}
    </DashboardLayout>
  )
}
