import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import Icon from '../ui/Icon'
import styles from './TrilhaCard.module.css'

const SUBJECT_ICON = {
  Matemática: 'math',    Português: 'book',    Química: 'flask',
  Biologia: 'dna',       Física: 'zap',        Geografia: 'globe',
  História: 'scroll',    Inglês: 'globe',       Artes: 'palette',
  Informática: 'monitor', Filosofia: 'brain',  Sociologia: 'scale',
}

export default function TrilhaCard({ trilha, started = false, onStart }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (started) {
      navigate(`/dashboard/trilha/${trilha.id}`)
    } else {
      onStart()
    }
  }

  return (
    <div className={`${styles.card} ${started ? styles.started : ''}`}>
      <div className={styles.header}>
        <span className={styles.emoji}>
          <Icon name={SUBJECT_ICON[trilha.disciplina] ?? 'bookOpen'} size={26} />
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
