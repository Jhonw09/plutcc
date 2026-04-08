import { useState } from 'react'
import { Button }     from '../ui/Button'
import { InputField } from '../ui/InputField'
import styles from './CreateClassModal.module.css'   // reuse identical modal shell styles

function validate({ title, classId }) {
  const e = {}
  if (!title.trim()) e.title   = 'Informe o título da atividade.'
  if (!classId)      e.classId = 'Selecione uma turma.'
  return e
}

const EMPTY = { title: '', description: '', classId: '', dueDate: '' }

export default function CreateActivityModal({ onClose, classes = [] }) {
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
    // TODO: POST /api/v1/atividades with fields when backend is ready
    onClose()
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.card}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-modal-title"
      >
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">✕</button>

        <div className={styles.header}>
          <span className={styles.headerIcon}>📝</span>
          <div>
            <h2 id="activity-modal-title" className={styles.title}>Criar atividade</h2>
            <p className={styles.sub}>Crie uma tarefa ou prova para uma das suas turmas.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className={styles.form}>

          <InputField
            id="act-title" name="title" label="Título da atividade"
            placeholder="Ex: Lista de exercícios — Funções"
            value={fields.title} onChange={e => set('title', e.target.value)}
            error={errors.title} autoFocus
          />

          {/* Class selector */}
          <div className={styles.fieldWrap}>
            <label htmlFor="act-class" className={styles.label}>Turma</label>
            <select
              id="act-class"
              className={`${styles.select} ${errors.classId ? styles.selectError : ''}`}
              value={fields.classId}
              onChange={e => set('classId', e.target.value)}
            >
              <option value="">Selecione uma turma</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            {errors.classId && <span className={styles.error} role="alert">{errors.classId}</span>}
          </div>

          <InputField
            id="act-desc" name="description" label="Descrição (opcional)"
            placeholder="Instruções ou observações para os alunos"
            value={fields.description} onChange={e => set('description', e.target.value)}
          />

          {/* Due date */}
          <div className={styles.fieldWrap}>
            <label htmlFor="act-due" className={styles.label}>Data de entrega (opcional)</label>
            <input
              id="act-due"
              type="date"
              className={styles.select}
              value={fields.dueDate}
              onChange={e => set('dueDate', e.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" type="submit">Criar atividade</Button>
          </div>

        </form>
      </div>
    </div>
  )
}
