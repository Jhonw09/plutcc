import { useState } from 'react'
import { Button }       from '../ui/Button'
import { InputField }   from '../ui/InputField'
import { useAuth }      from '../../context/AuthContext'
import { updateTrilha } from '../../api/services/trilhaService'
import SpotlightTour    from '../ui/SpotlightTour'
import Icon             from '../ui/Icon'
import styles from './CreateTrilhaModal.module.css'

const TOUR_KEY = 'plut_tour_criar_trilha'

const TOUR_STEPS = [
  {
    target: 'ct-nome',
    title: 'Nome da trilha',
    description: 'Escolha um nome claro. Ex: "Matemática Básica" ou "Português para o ENEM".',
  },
  {
    target: 'ct-disciplina',
    title: 'Disciplina',
    description: 'Selecione a área de conhecimento. Ajuda os alunos a encontrar sua trilha.',
  },
  {
    target: 'ct-tipo',
    title: 'Visibilidade',
    description: 'Pública aparece para todos os alunos. Privada só para quem você indicar.',
  },
  {
    target: 'ct-nivel',
    title: 'Nível',
    description: 'Indica a dificuldade da trilha. Ajuda o aluno a escolher o conteúdo certo.',
  },
  {
    target: 'ct-criar',
    title: 'Tudo pronto!',
    description: 'Clique em "Criar trilha". Depois você adiciona aulas com conteúdo, vídeos e exercícios.',
    placement: 'top',
  },
]

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

export default function CreateTrilhaModal({ onClose, onCreate, onEdit, initialData = null, forceTour = false }) {
  const { user } = useAuth()
  const isEdit = initialData !== null

  const [tourActive, setTourActive] = useState(() => {
    if (isEdit) return false
    if (forceTour) return true
    try { return localStorage.getItem(TOUR_KEY) !== 'true' } catch { return false }
  })

  const [fields, setFields] = useState(() => isEdit
    ? { name: initialData.nome, subject: initialData.disciplina, description: initialData.descricao ?? '', type: initialData.tipo, level: initialData.nivel }
    : { name: '', subject: '', description: '', type: 'PUBLICA', level: '' }
  )
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
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

    setLoading(true)
    setApiError('')
    try {
      if (isEdit) {
        const updated = await updateTrilha(initialData.id, {
          nome: fields.name.trim(), disciplina: fields.subject,
          descricao: fields.description.trim(), tipo: fields.type, nivel: fields.level,
        })
        onEdit({ ...initialData, ...updated })
      } else {
        await onCreate({
          nome: fields.name.trim(), disciplina: fields.subject,
          descricao: fields.description.trim(), tipo: fields.type, nivel: fields.level,
          professorId: user?.id, professorNome: user?.name,
        })
      }
      onClose()
    } catch (err) {
      setApiError(err.message ?? 'Erro ao salvar trilha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Tour fora do backdrop para não ter conflito de z-index */}
      <SpotlightTour
        steps={TOUR_STEPS}
        active={tourActive}
        onFinish={() => setTourActive(false)}
        storageKey={TOUR_KEY}
      />

      <div className={styles.backdrop} onClick={onClose}>
        <div className={styles.card} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">

          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar" disabled={loading}>
            <Icon name="close" size={14} />
          </button>

          <div className={styles.header}>
            <span className={styles.headerIcon}>
              <Icon name={isEdit ? 'pencil' : 'school'} size={22} />
            </span>
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

            <div data-tour="ct-nome">
              <InputField
                id="trilha-name" name="name" label="Nome da trilha"
                placeholder="Ex: Matemática Básica"
                value={fields.name} onChange={e => set('name', e.target.value)}
                error={errors.name} autoFocus disabled={loading}
              />
            </div>

            <div className={styles.fieldWrap} data-tour="ct-disciplina">
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

            <div className={styles.fieldWrap} data-tour="ct-tipo">
              <span className={styles.label}>Tipo de trilha</span>
              <div className={styles.typeToggle} role="group" aria-label="Tipo de trilha">
                {[
                  { value: 'PUBLICA', icon: 'globe', label: 'Pública',  hint: 'Aparece na comunidade' },
                  { value: 'PRIVADA', icon: 'lock',  label: 'Privada',  hint: 'Acesso apenas por código' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`${styles.typeBtn} ${fields.type === opt.value ? styles.typeBtnActive : ''}`}
                    onClick={() => set('type', opt.value)}
                    disabled={loading}
                  >
                    <span className={styles.typeBtnLabel}>
                      <Icon name={opt.icon} size={13} style={{display:'inline',verticalAlign:'middle',marginRight:5}} />
                      {opt.label}
                    </span>
                    <span className={styles.typeBtnHint}>{opt.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.fieldWrap} data-tour="ct-nivel">
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
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem', padding: '0.5rem', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: '4px' }}>
                {apiError}
              </div>
            )}

            <div className={styles.actions} data-tour="ct-criar">
              <Button variant="outline" type="button" onClick={onClose} disabled={loading}>Cancelar</Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Criando...' : (isEdit ? 'Salvar alterações' : 'Criar trilha')}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </>
  )
}
