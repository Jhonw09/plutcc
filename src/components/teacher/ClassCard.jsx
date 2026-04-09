import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { typeBadgeStyle } from '../../utils/subjectColors'
import Icon from '../ui/Icon'
import styles from './ClassCard.module.css'

const LEVEL_ICON  = { Fundamental: 'book', Médio: 'bookOpen', Vestibular: 'target' }
export const SUBJECT_ICON = {
  Matemática: 'math',    Português: 'book',    Química: 'flask',
  Biologia: 'dna',       Física: 'zap',        Geografia: 'globe',
  História: 'scroll',    Inglês: 'globe',       Artes: 'palette',
  Informática: 'monitor', Filosofia: 'brain',  Sociologia: 'scale',
}

function formatRelative(iso) {
  if (!iso) return null
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60)    return 'agora mesmo'
  if (diff < 3600)  return `há ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`
  if (diff < 86400 * 7) return `há ${Math.floor(diff / 86400)} dia${Math.floor(diff / 86400) !== 1 ? 's' : ''}`
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

export default function ClassCard({ id, nome, disciplina, descricao, tipo, nivel, codigo, alunoIds, criadaEm, onEdit, onDelete }) {
  const navigate   = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef    = useRef(null)
  const isPublic   = tipo === 'PUBLICA'
  const studentCount = alunoIds?.length ?? 0

  useEffect(() => {
    if (!menuOpen) return
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  function handleCardClick(e) {
    if (menuRef.current?.contains(e.target)) return
    navigate(`/turma/${id}`, {
      state: { id, nome, disciplina, descricao, tipo, nivel, codigo, alunoIds },
    })
  }

  function handleEdit(e) {
    e.stopPropagation()
    setMenuOpen(false)
    onEdit({ id, nome, disciplina, descricao, tipo, nivel, codigo, alunoIds, criadaEm })
  }

  function handleDelete(e) {
    e.stopPropagation()
    setMenuOpen(false)
    onDelete(id, nome)
  }

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={`${styles.strip} ${isPublic ? styles.stripPublic : styles.stripPrivate}`} />

      <div className={styles.body}>

        {/* ── Top row ── */}
        <div className={styles.top}>
          <span className={styles.subjectIcon}>
            <Icon name={SUBJECT_ICON[disciplina] ?? 'bookOpen'} size={22} />
          </span>
          <div className={styles.meta}>
            <span className={styles.name}>{nome}</span>
            <div className={styles.metaSub}>
              <span className={styles.subject}>{disciplina}</span>
              <span className={styles.dot}>·</span>
              <span className={styles.level}>
                <Icon name={LEVEL_ICON[nivel] ?? 'fileText'} size={12} style={{display:'inline',verticalAlign:'middle',marginRight:3}} />
                {nivel}
              </span>
            </div>
          </div>

          <span className={styles.typeBadge} style={typeBadgeStyle(tipo)}>
            {isPublic
              ? <><Icon name="globe" size={11} style={{display:'inline',verticalAlign:'middle',marginRight:3}} />Pública</>
              : <><Icon name="lock"  size={11} style={{display:'inline',verticalAlign:'middle',marginRight:3}} />Privada</>
            }
          </span>

          <div className={styles.menuWrap} ref={menuRef}>
            <button
              className={styles.menuBtn}
              onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
              aria-label="Opções da turma"
              aria-expanded={menuOpen}
            >
              ⋯
            </button>
            {menuOpen && (
              <div className={styles.menu} role="menu">
                <button className={styles.menuItem} onClick={handleEdit} role="menuitem">
                  <Icon name="pencil" size={13} /> Editar turma
                </button>
                <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={handleDelete} role="menuitem">
                  <Icon name="close" size={13} /> Excluir turma
                </button>
              </div>
            )}
          </div>
        </div>

        {descricao && <p className={styles.desc}>{descricao}</p>}

        <div className={styles.footer}>
          <div className={styles.stats}>
            <span className={styles.stat}>
              <span className={styles.statIcon}><Icon name="users" size={13} /></span>
              {studentCount} aluno{studentCount !== 1 ? 's' : ''}
            </span>
            {criadaEm && (
              <span className={styles.stat}>
                <span className={styles.statIcon}><Icon name="clock" size={13} /></span>
                Criada {formatRelative(criadaEm)}
              </span>
            )}
          </div>

          <div className={styles.codeWrap}>
            <span className={styles.codeLabel}>Código</span>
            <code className={styles.code}>{codigo}</code>
          </div>
        </div>

      </div>
    </div>
  )
}
