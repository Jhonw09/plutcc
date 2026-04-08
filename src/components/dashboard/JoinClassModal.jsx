import { useState } from 'react'
import { Button }     from '../ui/Button'
import { InputField } from '../ui/InputField'
import { MOCK_CLASSES } from '../../data/mockClasses'
import styles from './JoinClassModal.module.css'

const SUBJECT_EMOJI = {
  Matemática: '📐', Português: '📖', Química: '⚗️', Biologia: '🧬',
  Física: '⚡', Geografia: '🌍', História: '📜', Inglês: '🌐',
  Artes: '🎨', Informática: '💻', Filosofia: '🧠', Sociologia: '⚖️',
}

// Normalise input: trim + uppercase so "mat-3a-7x2k" matches "MAT-3A-7X2K"
function normalise(code) {
  return code.trim().toUpperCase()
}

export default function JoinClassModal({ onClose, onJoin, joinedCodes = [] }) {
  const [code,    setCode]    = useState('')
  const [error,   setError]   = useState('')
  const [preview, setPreview] = useState(null)   // found class before confirming

  function handleCodeChange(e) {
    setCode(e.target.value)
    setError('')
    setPreview(null)
  }

  function handleSearch(e) {
    e.preventDefault()
    const key = normalise(code)

    if (!key) {
      setError('Informe o código da turma.')
      return
    }

    const found = MOCK_CLASSES[key]

    if (!found) {
      setError('Código inválido. Verifique e tente novamente.')
      setPreview(null)
      return
    }

    if (joinedCodes.includes(key)) {
      setError('Você já está nessa turma.')
      setPreview(null)
      return
    }

    setError('')
    setPreview(found)
  }

  function handleConfirm() {
    onJoin({ ...preview })
    onClose()
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.card}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-modal-title"
      >
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">✕</button>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerIcon}>🔑</span>
          <div>
            <h2 id="join-modal-title" className={styles.title}>Entrar em uma turma</h2>
            <p className={styles.sub}>Cole o código que o professor compartilhou.</p>
          </div>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} noValidate className={styles.form}>
          <InputField
            id="join-code"
            name="code"
            label="Código da turma"
            placeholder="Ex: MAT-3A-7X2K"
            value={code}
            onChange={handleCodeChange}
            error={error}
            autoFocus
            autoComplete="off"
            style={{ textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'monospace' }}
          />
          <Button variant="outline" type="submit">Buscar turma</Button>
        </form>

        {/* Preview card — shown after a successful lookup */}
        {preview && (
          <div className={styles.preview}>
            <div className={styles.previewTop}>
              <span className={styles.previewIcon}>
                {SUBJECT_EMOJI[preview.disciplina] ?? '📚'}
              </span>
              <div className={styles.previewMeta}>
                <span className={styles.previewName}>{preview.nome}</span>
                <span className={styles.previewTeacher}>{preview.professor}</span>
              </div>
              <span className={`${styles.typeBadge} ${preview.tipo === 'PUBLICA' ? styles.public : styles.private}`}>
                {preview.tipo === 'PUBLICA' ? '🌐 Pública' : '🔒 Privada'}
              </span>
            </div>

            {preview.descricao && (
              <p className={styles.previewDesc}>{preview.descricao}</p>
            )}

            <div className={styles.previewPills}>
              <span className={styles.pill}>{preview.disciplina}</span>
              <span className={styles.pill}>{preview.nivel}</span>
              <span className={styles.pill}>
                👥 {preview.alunoIds.length} aluno{preview.alunoIds.length !== 1 ? 's' : ''}
              </span>
            </div>

            <Button variant="primary" onClick={handleConfirm} className={styles.confirmBtn}>
              ✓ Entrar na turma
            </Button>
          </div>
        )}

        {/* Hint */}
        {!preview && (
          <p className={styles.hint}>
            💡 Não tem um código? Peça ao seu professor ou explore turmas públicas na{' '}
            <strong>Comunidade</strong>.
          </p>
        )}
      </div>
    </div>
  )
}
