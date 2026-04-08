import { useNavigate } from 'react-router-dom'
import { tagStyle } from '../../utils/subjectColors'
import styles from './ClassCard.module.css'

const LEVEL_EMOJI = { Fundamental: '📗', Médio: '📘', Vestibular: '🎯' }
const SUBJECT_EMOJI = {
  Matemática: '📐', Português: '📖', Química: '⚗️', Biologia: '🧬',
  Física: '⚡', Geografia: '🌍', História: '📜', Inglês: '🌐',
  Artes: '🎨', Informática: '💻', Filosofia: '🧠', Sociologia: '⚖️',
}

export default function ClassCard({ id, nome, disciplina, descricao, tipo, nivel, codigo, alunoIds }) {
  const navigate = useNavigate()
  const isPublic = tipo === 'PUBLICA'

  function handleClick() {
    navigate(`/turma/${id}`, {
      state: { id, nome, disciplina, descricao, tipo, nivel, codigo, alunoIds },
    })
  }

  return (
    <div className={styles.card} onClick={handleClick}>

      {/* Left strip signals type — no separate type badge needed */}
      <div className={`${styles.strip} ${isPublic ? styles.stripPublic : styles.stripPrivate}`} />

      <div className={styles.body}>
        <div className={styles.top}>
          <span className={styles.subjectIcon}>
            {SUBJECT_EMOJI[disciplina] ?? '📚'}
          </span>
          <div className={styles.meta}>
            <span className={styles.name}>{nome}</span>
            <span className={styles.subject}>{disciplina}</span>
          </div>
        </div>

        {descricao && <p className={styles.desc}>{descricao}</p>}

        <div className={styles.bottom}>
          <span className={styles.pill} style={tagStyle(disciplina)}>{disciplina}</span>
          <span className={styles.pill} style={tagStyle(nivel)}>
            {LEVEL_EMOJI[nivel] ?? '📋'} {nivel}
          </span>
          <span className={styles.pill}>
            👥 {alunoIds.length} aluno{alunoIds.length !== 1 ? 's' : ''}
          </span>
          <div className={styles.codeWrap}>
            <span className={styles.codeLabel}>Código</span>
            <code className={styles.code}>{codigo}</code>
          </div>
        </div>
      </div>
    </div>
  )
}
