import { useState, useRef, useEffect, useCallback } from 'react'
import { Button }       from '../ui/Button'
import { InputField }   from '../ui/InputField'
import { useAuth }      from '../../context/AuthContext'
import { updateTrilha } from '../../api/services/trilhaService'
import Icon             from '../ui/Icon'
import styles from './CreateTrilhaModal.module.css'

const TOUR_KEY = 'plut_tour_criar_trilha'

const TOUR_STEPS = [
  {
    field:    'name',
    ref:      'ref-name',
    title:    'Nome da trilha',
    hint:     'Escolha um nome claro e objetivo para sua trilha.',
    example:  '"Matemática Básica" ou "Português para o ENEM"',
    optional: false,
  },
  {
    field:    'subject',
    ref:      'ref-subject',
    title:    'Disciplina',
    hint:     'Selecione a área de conhecimento. Ajuda os alunos a encontrar sua trilha.',
    example:  null,
    optional: false,
  },
  {
    field:    'description',
    ref:      'ref-description',
    title:    'Descrição',
    hint:     'Descreva brevemente o que o aluno vai aprender nesta trilha.',
    example:  '"Fundamentos de álgebra para o ensino médio."',
    optional: true,
  },
  {
    field:    'type',
    ref:      'ref-type',
    title:    'Visibilidade',
    hint:     'Pública aparece para todos os alunos. Privada fica acessível apenas para quem você indicar.',
    example:  null,
    optional: false,
  },
  {
    field:    'level',
    ref:      'ref-level',
    title:    'Nível',
    hint:     'Indica a dificuldade do conteúdo. Ajuda o aluno a escolher a trilha certa.',
    example:  null,
    optional: false,
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
  if (!name.trim()) e.name    = 'Informe o nome da trilha.'
  if (!subject)     e.subject = 'Selecione uma disciplina.'
  if (!level)       e.level   = 'Selecione um nível.'
  return e
}

export default function CreateTrilhaModal({ onClose, onCreate, onEdit, initialData = null, forceTour = false }) {
  const { user } = useAuth()
  const isEdit = initialData !== null

  const [tourStep, setTourStep] = useState(() => {
    if (isEdit) return -1
    if (forceTour) return 0
    try { return localStorage.getItem(TOUR_KEY) !== 'true' ? 0 : -1 } catch { return -1 }
  })

  const tourActive  = tourStep >= 0 && tourStep < TOUR_STEPS.length
  const currentStep = tourActive ? TOUR_STEPS[tourStep] : null
  const isLastStep  = tourStep === TOUR_STEPS.length - 1

  // refs para cada campo — usados para medir posição do spotlight
  const refs = {
    'ref-name':        useRef(null),
    'ref-subject':     useRef(null),
    'ref-description': useRef(null),
    'ref-type':        useRef(null),
    'ref-level':       useRef(null),
  }

  const [spotRect, setSpotRect] = useState(null)

  const measureSpot = useCallback(() => {
    if (!currentStep) return
    const el = refs[currentStep.ref]?.current
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    setTimeout(() => {
      const r = el.getBoundingClientRect()
      setSpotRect({ top: r.top - 8, left: r.left - 8, width: r.width + 16, height: r.height + 16 })
    }, 120)
  }, [currentStep]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!tourActive) { setSpotRect(null); return }
    setSpotRect(null)
    measureSpot()
  }, [tourStep, tourActive, measureSpot])

  useEffect(() => {
    if (!tourActive) return
    const handler = () => measureSpot()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [tourActive, measureSpot])

  function tourNext() {
    if (!isLastStep) { setTourStep(s => s + 1) }
    else finishTour()
  }

  function finishTour() {
    try { localStorage.setItem(TOUR_KEY, 'true') } catch {}
    setTourStep(-1)
  }

  function canAdvance() {
    if (!currentStep) return false
    if (currentStep.optional) return true
    const f = fields[currentStep.field]
    return f !== undefined && String(f).trim() !== ''
  }

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

  // tooltip posicionado abaixo do spotlight, ou acima se não couber
  function tooltipStyle() {
    if (!spotRect) return {}
    const below = spotRect.top + spotRect.height + 16
    const fitsBelow = below + 160 < window.innerHeight
    return fitsBelow
      ? { top: below, left: Math.max(16, spotRect.left) }
      : { top: spotRect.top - 170, left: Math.max(16, spotRect.left) }
  }

  return (
    <>
      {/* ── Tour overlay (fora do modal para cobrir tudo) ── */}
      {tourActive && spotRect && (
        <div className={styles.tourRoot}>
          {/* Overlay escuro com buraco no campo */}
          <svg className={styles.tourOverlaySvg} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <mask id="tour-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={spotRect.left}
                  y={spotRect.top}
                  width={spotRect.width}
                  height={spotRect.height}
                  rx="12"
                  fill="black"
                />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.72)" mask="url(#tour-mask)" />
          </svg>

          {/* Borda brilhante ao redor do campo */}
          <div
            className={styles.tourSpotBorder}
            style={{
              top:    spotRect.top,
              left:   spotRect.left,
              width:  spotRect.width,
              height: spotRect.height,
            }}
          />

          {/* Tooltip */}
          <div className={styles.tourTooltip} style={tooltipStyle()}>
            <div className={styles.tourTooltipHead}>
              <span className={styles.tourBadge}>{tourStep + 1} / {TOUR_STEPS.length}</span>
              {currentStep.optional && (
                <span className={styles.tourOptional}>opcional</span>
              )}
              <button className={styles.tourSkip} onClick={finishTour} type="button">Pular tour</button>
            </div>

            <h4 className={styles.tourTitle}>{currentStep.title}</h4>
            <p className={styles.tourHint}>{currentStep.hint}</p>
            {currentStep.example && (
              <p className={styles.tourExample}>{currentStep.example}</p>
            )}

            <div className={styles.tourNav}>
              <div className={styles.tourDots}>
                {TOUR_STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`${styles.tourDot} ${i === tourStep ? styles.tourDotActive : i < tourStep ? styles.tourDotDone : ''}`}
                  />
                ))}
              </div>
              <button
                type="button"
                className={styles.tourNextBtn}
                onClick={tourNext}
                disabled={!canAdvance()}
              >
                {isLastStep ? 'Concluir ✓' : 'Próximo →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      <div className={styles.backdrop} onClick={tourActive ? undefined : onClose}>
        <div
          className={styles.card}
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {!tourActive && (
            <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar" disabled={loading}>
              <Icon name="close" size={14} />
            </button>
          )}

          <div className={styles.header}>
            <span className={styles.headerIcon}>
              <Icon name={isEdit ? 'pencil' : 'school'} size={22} />
            </span>
            <div>
              <h2 id="modal-title" className={styles.title}>
                {isEdit ? 'Editar trilha' : tourActive ? 'Vamos criar sua trilha' : 'Criar nova trilha'}
              </h2>
              <p className={styles.sub}>
                {tourActive
                  ? 'Preencha o campo destacado e clique em Próximo.'
                  : isEdit ? 'Atualize os dados da trilha abaixo.' : 'Preencha os dados abaixo para criar sua trilha.'}
              </p>
            </div>
          </div>

          {tourActive && (
            <div className={styles.tourProgressBar}>
              <div
                className={styles.tourProgressFill}
                style={{ width: `${((tourStep + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className={styles.form}>

            <div ref={refs['ref-name']}>
              <InputField
                id="trilha-name" name="name" label="Nome da trilha"
                placeholder='Ex: "Matemática Básica"'
                value={fields.name} onChange={e => set('name', e.target.value)}
                error={errors.name}
                disabled={loading || (tourActive && currentStep?.field !== 'name')}
              />
            </div>

            <div className={styles.fieldWrap} ref={refs['ref-subject']}>
              <label htmlFor="class-subject" className={styles.label}>Disciplina</label>
              <select
                id="class-subject"
                className={`${styles.select} ${errors.subject ? styles.selectError : ''}`}
                value={fields.subject}
                onChange={e => set('subject', e.target.value)}
                disabled={loading || (tourActive && currentStep?.field !== 'subject')}
              >
                <option value="">Selecione uma disciplina</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.subject && <span className={styles.error} role="alert">{errors.subject}</span>}
            </div>

            <div ref={refs['ref-description']}>
              <InputField
                id="class-desc" name="description" label="Descrição (opcional)"
                placeholder="Sobre o que é essa trilha?"
                value={fields.description} onChange={e => set('description', e.target.value)}
                disabled={loading || (tourActive && currentStep?.field !== 'description')}
              />
            </div>

            <div className={styles.fieldWrap} ref={refs['ref-type']}>
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
                    disabled={loading || (tourActive && currentStep?.field !== 'type')}
                  >
                    <span className={styles.typeBtnLabel}>
                      <Icon name={opt.icon} size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />
                      {opt.label}
                    </span>
                    <span className={styles.typeBtnHint}>{opt.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.fieldWrap} ref={refs['ref-level']}>
              <label htmlFor="class-level" className={styles.label}>Nível</label>
              <select
                id="class-level"
                className={`${styles.select} ${errors.level ? styles.selectError : ''}`}
                value={fields.level}
                onChange={e => set('level', e.target.value)}
                disabled={loading || (tourActive && currentStep?.field !== 'level')}
              >
                <option value="">Selecione um nível</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              {errors.level && <span className={styles.error} role="alert">{errors.level}</span>}
            </div>

            {apiError && <div className={styles.apiError}>{apiError}</div>}

            {!tourActive && (
              <div className={styles.actions}>
                <Button variant="outline" type="button" onClick={onClose} disabled={loading}>Cancelar</Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar trilha'}
                </Button>
              </div>
            )}

          </form>
        </div>
      </div>
    </>
  )
}
