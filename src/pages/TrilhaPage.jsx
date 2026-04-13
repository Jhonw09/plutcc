import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import TeacherLayout from '../components/teacher/TeacherLayout'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import styles from './TrilhaPage.module.css'

// Emoji para disciplinas
const SUBJECT_EMOJI = {
  Matemática: '📐',
  Português: '📖',
  Química: '⚗️',
  Biologia: '🧬',
  Física: '⚡',
  Geografia: '🌍',
  História: '📜',
  Inglês: '🌐',
  Artes: '🎨',
  Informática: '💻',
  Filosofia: '🧠',
  Sociologia: '⚖️',
}

// Emoji para tipo de aula
const AULA_EMOJI = {
  texto: '📄',
  video: '🎥',
}

export default function TrilhaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [trilha, setTrilha] = useState(null)
  const [aulas, setAulas] = useState([])
  const [loading, setLoading] = useState(true)

  const location = useLocation()

  useEffect(() => {
    const state = location.state
    if (state && state.id) {
      setTrilha({ ...state, professorNome: user?.nome || user?.name || '' })
      setAulas([])
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [id, location.state, user])

  if (loading) {
    return (
      <TeacherLayout>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <span className={styles.loadingIcon}>⏳</span>
            <h3 className={styles.loadingText}>Carregando trilha...</h3>
          </div>
        </div>
      </TeacherLayout>
    )
  }

  if (!trilha) {
    return (
      <TeacherLayout>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <span className={styles.errorIcon}>⚠️</span>
            <h3 className={styles.errorText}>Trilha não encontrada</h3>
            <Button variant="primary" onClick={() => navigate('/teacher-dashboard')}>
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </TeacherLayout>
    )
  }

  const emoji = SUBJECT_EMOJI[trilha.disciplina] || '📚'

  return (
    <TeacherLayout>
      <div className={styles.container}>
        {/* ── HEADER DA TRILHA ── */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerTop}>
              <span className={styles.emoji}>{emoji}</span>
              <div className={styles.headerInfo}>
                <h1 className={styles.title}>{trilha.nome}</h1>
                <p className={styles.professor}>👨‍🏫 {trilha.professorNome}</p>
              </div>
            </div>

            <p className={styles.description}>
              {trilha.descricao}
            </p>

            <div className={styles.headerFooter}>
              <div className={styles.badges}>
                <span className={styles.badge}>{trilha.disciplina}</span>
                <span className={styles.badge}>{trilha.nivel}</span>
              </div>
              <Button variant="primary" size="large">
                ▶️ Começar trilha
              </Button>
            </div>
          </div>
        </header>

        {/* ── SEÇÃO DE AULAS ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>📚 Aulas da trilha</h2>
            <p className={styles.sectionSubtitle}>
              {aulas.length} aula{aulas.length !== 1 ? 's' : ''} •
              {aulas.filter(a => a.tipo === 'video').length} vídeo{aulas.filter(a => a.tipo === 'video').length !== 1 ? 's' : ''}
            </p>
          </div>

          {aulas.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📭</span>
              <p className={styles.emptyText}>Nenhuma aula disponível</p>
            </div>
          ) : (
            <div className={styles.aulasList}>
              {aulas.map((aula, index) => (
                <div key={aula.id} className={styles.aulaCard}>
                  <div className={styles.aulaNumber}>{index + 1}</div>

                  <div className={styles.aulaContent}>
                    <div className={styles.aulaMeta}>
                      <h3 className={styles.aulaTitle}>
                        <span className={styles.aulaEmoji}>
                          {AULA_EMOJI[aula.tipo] || '📄'}
                        </span>
                        {aula.titulo}
                      </h3>
                      <span className={styles.aulaType}>
                        {aula.tipo === 'video' ? '🎥 Vídeo' : '📄 Texto'}
                      </span>
                    </div>

                    {aula.descricao && (
                      <p className={styles.aulaDescription}>{aula.descricao}</p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => alert(`Aula "${aula.titulo}" será aberta em breve!`)}
                  >
                    Ver aula →
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </TeacherLayout>
  )
}