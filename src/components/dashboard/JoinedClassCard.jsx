import { useNavigate } from 'react-router-dom'
import { typeBadgeStyle } from '../../utils/subjectColors'
import Icon from '../ui/Icon'
import { Tag } from '../ui/Tag'
import styles from './JoinedClassCard.module.css'

const SUBJECT_ICON = {
  Matemática: 'math',   Português: 'book',    Química: 'flask',
  Biologia: 'dna',      Física: 'zap',        Geografia: 'globe',
  História: 'scroll',   Inglês: 'globe',      Artes: 'palette',
  Informática: 'monitor', Filosofia: 'brain',  Sociologia: 'scale',
}

export default function JoinedClassCard({ id, nome, disciplina, descricao, tipo, nivel, codigo, professorNome, membros }) {
  const navigate = useNavigate()
  const isPublic = tipo === 'PUBLICA'
  // Count only students (members with role === 'student')
  const students = (membros ?? []).filter(m => m.role === 'student')
  const studentCount = students.length
  const displayProfessor = professorNome ?? 'Professor'

  function handleOpen() {
    navigate(`/turma/${id ?? codigo}`, {
      state: { id: id ?? codigo, nome, disciplina, descricao, tipo, nivel, codigo, professorNome },
    })
  }

  return (
    <div className={styles.card} onClick={handleOpen}>

      <div className={styles.iconCol}>
        <Icon name={SUBJECT_ICON[disciplina] ?? 'bookOpen'} size={22} />
      </div>

      <div className={styles.body}>
        <div className={styles.top}>
          <div className={styles.meta}>
            <span className={styles.name}>{nome}</span>
            <span className={styles.teacher}>{displayProfessor}</span>
          </div>
          {/* Type badge — top-right, visually separated from subject/level */}
          <span className={styles.typeBadge} style={typeBadgeStyle(tipo)}>
            {isPublic
              ? <><Icon name="globe" size={12} style={{display:'inline',verticalAlign:'middle',marginRight:4}} />Pública</>
              : <><Icon name="lock"  size={12} style={{display:'inline',verticalAlign:'middle',marginRight:4}} />Privada</>
            }
          </span>
        </div>

        {descricao && <p className={styles.desc}>{descricao}</p>}

        <div className={styles.bottom}>
          <code className={styles.code}>{codigo}</code>
          <Tag value={disciplina} />
          <Tag value={nivel} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: 'auto', display:'inline-flex', alignItems:'center', gap:4 }}>
            <Icon name="users" size={14} /> {studentCount} {studentCount === 1 ? 'aluno' : 'alunos'}
          </span>
          <button className={styles.enterBtn} onClick={e => { e.stopPropagation(); handleOpen() }}>Acessar →</button>
        </div>
      </div>

    </div>
  )
}
