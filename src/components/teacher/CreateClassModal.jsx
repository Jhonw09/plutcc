import { useState } from 'react'
import { Button }     from '../ui/Button'
import { InputField } from '../ui/InputField'
import styles from './CreateClassModal.module.css'

const SUBJECTS = [
  'Matemática', 'Português', 'Química', 'Biologia',
  'Física', 'Geografia', 'História', 'Inglês',
  'Artes', 'Informática', 'Filosofia', 'Sociologia',
]

const LEVELS = ['Fundamental', 'Médio', 'Vestibular']

// e.g. "MAT-3A-7X2K"
function generateCode(subject) {
  const prefix = subject.slice(0, 3).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const chars  = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const rand   = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${prefix}-${rand(2)}${Math.floor(Math.random() * 9 + 1)}-${rand(4)}`
}

function validate({ name, subject, level }) {
  const e = {}
  if (!name.trim())    e.name    = 'Informe o nome da turma.'
  if (!subject)        e.subject = 'Selecione uma disciplina.'
  if (!level)          e.level   = 'Selecione um nível.'
  return e
}

const EMPTY = { name: '', subject: '', description: '', type: 'PUBLICA', level: '' }

export default function CreateClassModal({ onClose, onCreate }) {
  const [fields, setFields] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  function set(key, value) {
    setFields(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(fields)
    if (Object.keys(errs).length) { setErrors(errs); return }

    onCreate({
      id:          Date.now(),
      nome:        fields.name.trim(),
      disciplina:  fields.subject,
      descricao:   fields.description.trim(),
      tipo:        fields.type,
      nivel:       fields.level,
      codigo:      generateCode(fields.subject),
      alunoIds:    [],
      criadaEm:    new Date().toISOString(),
    })
    onClose()
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">

        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">✕</button>

        <div className={styles.header}>
          <span className={styles.headerIcon}>🏫</span>
          <div>
            <h2 id="modal-title" className={styles.title}>Criar nova turma</h2>
            <p className={styles.sub}>Preencha os dados abaixo para criar sua turma.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className={styles.form}>

          <InputField
            id="class-name" name="name" label="Nome da turma"
            placeholder="Ex: 3º A — Matemática"
            value={fields.name} onChange={e => set('name', e.target.value)}
            error={errors.name} autoFocus
          />

          {/* Subject — native select styled to match InputField */}
          <div className={styles.fieldWrap}>
            <label htmlFor="class-subject" className={styles.label}>Disciplina</label>
            <select
              id="class-subject"
              className={`${styles.select} ${errors.subject ? styles.selectError : ''}`}
              value={fields.subject}
              onChange={e => set('subject', e.target.value)}
            >
              <option value="">Selecione uma disciplina</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.subject && <span className={styles.error} role="alert">{errors.subject}</span>}
          </div>

          <InputField
            id="class-desc" name="description" label="Descrição (opcional)"
            placeholder="Sobre o que é essa turma?"
            value={fields.description} onChange={e => set('description', e.target.value)}
          />

          {/* Type toggle */}
          <div className={styles.fieldWrap}>
            <span className={styles.label}>Tipo de turma</span>
            <div className={styles.typeToggle} role="group" aria-label="Tipo de turma">
              {[
                { value: 'PUBLICA',  label: '🌐 Pública',  hint: 'Aparece na comunidade' },
                { value: 'PRIVADA',  label: '🔒 Privada',  hint: 'Acesso apenas por código' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.typeBtn} ${fields.type === opt.value ? styles.typeBtnActive : ''}`}
                  onClick={() => set('type', opt.value)}
                >
                  <span className={styles.typeBtnLabel}>{opt.label}</span>
                  <span className={styles.typeBtnHint}>{opt.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Level — native select */}
          <div className={styles.fieldWrap}>
            <label htmlFor="class-level" className={styles.label}>Nível</label>
            <select
              id="class-level"
              className={`${styles.select} ${errors.level ? styles.selectError : ''}`}
              value={fields.level}
              onChange={e => set('level', e.target.value)}
            >
              <option value="">Selecione um nível</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            {errors.level && <span className={styles.error} role="alert">{errors.level}</span>}
          </div>

          <div className={styles.actions}>
            <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" type="submit">Criar turma</Button>
          </div>

        </form>
      </div>
    </div>
  )
}
