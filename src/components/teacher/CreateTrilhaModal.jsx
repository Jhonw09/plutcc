import { useState } from 'react'
import { Button }     from '../ui/Button'
import { InputField } from '../ui/InputField'
import { useClass }   from '../../hooks/useClass'
import { useAuth }    from '../../context/AuthContext'
import styles from './CreateTrilhaModal.module.css'

const SUBJECTS = [
  'Matemática', 'Português', 'Química', 'Biologia',
  'Física', 'Geografia', 'História', 'Inglês',
  'Artes', 'Informática', 'Filosofia', 'Sociologia',
]

const LEVELS = ['Fundamental', 'Médio', 'Vestibular']

function validate({ name, subject, level }) {
  const e = {}
  if (!name.trim())    e.name    = 'Informe o nome da trilha.'
  if (!subject)        e.subject = 'Selecione uma disciplina.'
  if (!level)          e.level   = 'Selecione um nível.'
  return e
}

/**
 * Dual-mode modal: create (no initialData) or edit (initialData provided).
 *
 * Create mode: calls trilhaService.createTrilha directly, returns trilha.
 * Edit mode:   preserves existing id, calls onEdit(updatedObject).
 */
export default function CreateTrilhaModal({ onClose, onCreate, onEdit, initialData = null }) {
  const { user } = useAuth()
  const isEdit = initialData !== null

  const [fields, setFields] = useState(() => isEdit
    ? { name: initialData.nome, subject: initialData.disciplina, description: initialData.descricao ?? '', type: initialData.tipo, level: initialData.nivel }
    : { name: '', subject: '', description: '', type: 'PUBLICA', level: '' }
  )
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  function set(key, value) {
    setFields(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
    if (apiError) setApiError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(fields)
    if (Object.keys(errs).length) { setErrors(errs); return }

    if (isEdit) {
      onEdit({
        ...initialData,
        nome:       fields.name.trim(),
        disciplina: fields.subject,
        descricao:  fields.description.trim(),
        tipo:       fields.type,
        nivel:      fields.level,
      })
      onClose()
    } else {
      setLoading(true)
      setApiError('')
      try {
        const newClass = {
          nome:          fields.name.trim(),
          disciplina:    fields.subject,
          descricao:     fields.description.trim(),
          tipo:          fields.type,
          nivel:         fields.level,
          professorId:   user?.id,
          professorNome: user?.name,
        }
        await onCreate(newClass)
        onClose()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao criar trilha'
        setApiError(msg)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">

        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar" disabled={loading}>✕</button>

        <div className={styles.header}>
          <span className={styles.headerIcon}>{isEdit ? '✏️' : '🏫'}</span>
          <div>
            <h2 id="modal-title" className={styles.title}>
              {isEdit ? 'Editar trilha' : 'Criar nova trilha'}
            </h2>
            <p className={styles.sub}>
              {isEdit ? 'Atualize os dados da trilha abaixo.' : 'Preencha os dados abaixo para criar sua trilha.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className={styles.form}>

          <InputField
            id="trilha-name" name="name" label="Nome da trilha"
            placeholder="Ex: 3º A — Matemática"
            value={fields.name} onChange={e => set('name', e.target.value)}
            error={errors.name} autoFocus disabled={loading}
          />

          <div className={styles.fieldWrap}>
            <label htmlFor="class-subject" className={styles.label}>Disciplina</label>
            <select
              id="class-subject"
              className={`${styles.select} ${errors.subject ? styles.selectError : ''}`}
              value={fields.subject}
              onChange={e => set('subject', e.target.value)}
              disabled={loading}
            >
              <option value="">Selecione uma disciplina</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.subject && <span className={styles.error} role="alert">{errors.subject}</span>}
          </div>

          <InputField
            id="class-desc" name="description" label="Descrição (opcional)"
            placeholder="Sobre o que é essa trilha?"
            value={fields.description} onChange={e => set('description', e.target.value)}
            disabled={loading}
          />

          <div className={styles.fieldWrap}>
            <span className={styles.label}>Tipo de trilha</span>
            <div className={styles.typeToggle} role="group" aria-label="Tipo de trilha">
              {[
                { value: 'PUBLICA',  label: '🌐 Pública',  hint: 'Aparece na comunidade' },
                { value: 'PRIVADA',  label: '🔒 Privada',  hint: 'Acesso apenas por código' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.typeBtn} ${fields.type === opt.value ? styles.typeBtnActive : ''}`}
                  onClick={() => set('type', opt.value)}
                  disabled={loading}
                >
                  <span className={styles.typeBtnLabel}>{opt.label}</span>
                  <span className={styles.typeBtnHint}>{opt.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldWrap}>
            <label htmlFor="class-level" className={styles.label}>Nível</label>
            <select
              id="class-level"
              className={`${styles.select} ${errors.level ? styles.selectError : ''}`}
              value={fields.level}
              onChange={e => set('level', e.target.value)}
              disabled={loading}
            >
              <option value="">Selecione um nível</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            {errors.level && <span className={styles.error} role="alert">{errors.level}</span>}
          </div>

          {apiError && (
            <div style={{ color: 'var(--error)', fontSize: '0.85rem', padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
              {apiError}
            </div>
          )}

          <div className={styles.actions}>
            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? '⏳ Criando...' : (isEdit ? 'Salvar alterações' : 'Criar trilha')}
            </Button>
          </div>

        </form>
      </div>
    </div>
  )
}
