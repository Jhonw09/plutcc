import { useNavigate } from 'react-router-dom'
import { typeBadgeStyle } from '../../utils/subjectColors'
import { Tag } from '../ui/Tag'
import styles from './JoinedClassCard.module.css'

const SUBJECT_EMOJI = {
  Matemática: '📐', Português: '📖', Química: '⚗️', Biologia: '🧬',
  Física: '⚡', Geografia: '🌍', História: '📜', Inglês: '🌐',
  Artes: '🎨', Informática: '💻', Filosofia: '🧠', Sociologia: '⚖️',
}

export default function JoinedClassCard({ id, nome, disciplina, descricao, tipo, nivel, codigo, professor }) {
  const navigate = useNavigate()
  const isPublic = tipo === 'PUBLICA'

  function handleOpen() {
    navigate(`/turma/${id ?? codigo}`, {
      state: { id: id ?? codigo, nome, disciplina, descricao, tipo, nivel, codigo, professor },
    })
  }

  return (
    <div className={styles.card} onClick={handleOpen}>

      <div className={styles.iconCol}>
        <span className={styles.icon}>{SUBJECT_EMOJI[disciplina] ?? '📚'}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.top}>
          <div className={styles.meta}>
            <span className={styles.name}>{nome}</span>
            <span className={styles.teacher}>{professor}</span>
          </div>
          {/* Type badge — top-right, visually separated from subject/level */}
          <span className={styles.typeBadge} style={typeBadgeStyle(tipo)}>
            {isPublic ? '🌐 Pública' : '🔒 Privada'}
          </span>
        </div>

        {descricao && <p className={styles.desc}>{descricao}</p>}

        <div className={styles.bottom}>
          <code className={styles.code}>{codigo}</code>
          <Tag value={disciplina} />
          <Tag value={nivel} />
          <button className={styles.enterBtn} onClick={e => { e.stopPropagation(); handleOpen() }}>Acessar →</button>
        </div>
      </div>

    </div>
  )
}
