import { useState } from 'react'
import { Button }     from '../ui/Button'
import { InputField } from '../ui/InputField'
import { useClass }   from '../../hooks/useClass'
import { useAuth }    from '../../context/AuthContext'
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
  const { user } = useAuth()
  const { joinClass, loading } = useClass()
  
  const [code,    setCode]    = useState('')
  const [error,   setError]   = useState('')
  const [preview, setPreview] = useState(null)   // found class before confirming

  function handleCodeChange(e) {
    setCode(e.target.value)
    setError('')
    setPreview(null)
  }

  async function handleSearch(e) {
    e.preventDefault()
    const key = normalise(code)

    if (!key) {
      setError('Informe o código da turma.')
      return
    }

    if (joinedCodes.includes(key)) {
      setError('Você já está nessa turma.')
      setPreview(null)
      return
    }

    setError('')
    try {
      // joinClass with just a code will search and return class data
      const found = await joinClass(key)
      setPreview(found)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Código inválido. Verifique e tente novamente.'
      setError(msg)
      setPreview(null)
    }
  }

  async function handleConfirm() {
    try {
      // The class is already joined via the preview request, so just return it
      onJoin({ ...preview })
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao entrar na turma.'
      setError(msg)
    }
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
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar" disabled={loading}>✕</button>

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
            disabled={loading}
            style={{ textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'monospace' }}
          />
          <Button 
            variant="outline" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Buscando...' : 'Buscar turma'}
          </Button>
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
                <span className={styles.previewTeacher}>{preview.professorNome}</span>
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
                👥 {preview.membros?.length ?? 0} membro{(preview.membros?.length ?? 0) !== 1 ? 's' : ''}
              </span>
            </div>

            <Button 
              variant="primary" 
              onClick={handleConfirm} 
              className={styles.confirmBtn}
              disabled={loading}
            >
              {loading ? '⏳ Entrando...' : '✓ Entrar na turma'}
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
