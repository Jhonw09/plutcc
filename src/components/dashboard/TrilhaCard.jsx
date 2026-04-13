import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import styles from './TrilhaCard.module.css'

const SUBJECT_EMOJI = {
  Matemática: '📐', Português: '📖', Química: '⚗️', Biologia: '🧬',
  Física: '⚡', Geografia: '🌍', História: '📜', Inglês: '🌐',
  Artes: '🎨', Informática: '💻', Filosofia: '🧠', Sociologia: '⚖️',
}

export default function TrilhaCard({ trilha, started = false, onStart }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (started) {
      // Navigate to trilha page
      navigate(`/trilha/${trilha.id}`)
    } else {
      // Call onStart
      onStart()
    }
  }

  return (
    <div className={`${styles.card} ${started ? styles.started : ''}`}>
      <div className={styles.header}>
        <span className={styles.emoji}>
          {SUBJECT_EMOJI[trilha.disciplina] ?? '📚'}
        </span>
        <div className={styles.meta}>
          <h3 className={styles.title}>{trilha.nome}</h3>
          <p className={styles.teacher}>{trilha.professorNome}</p>
        </div>
        {started && <span className={styles.startedBadge}>Iniciada</span>}
      </div>

      {trilha.descricao && (
        <p className={styles.description}>{trilha.descricao}</p>
      )}

      <div className={styles.footer}>
        <div className={styles.tags}>
          <span className={styles.tag}>{trilha.disciplina}</span>
          <span className={styles.tag}>{trilha.nivel}</span>
          <span className={styles.tag}>{trilha.tipo}</span>
        </div>
        <Button
          variant={started ? "outline" : "primary"}
          size="small"
          onClick={handleClick}
        >
          {started ? 'Continuar' : 'Iniciar'}
        </Button>
      </div>
    </div>
  )
}