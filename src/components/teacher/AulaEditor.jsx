import { useState, useRef, useEffect, useCallback } from 'react'
import Icon from '../ui/Icon'
import styles from './AulaEditor.module.css'

const AULA_TOUR_KEY = 'plut_tour_aula_editor'

const BLOCK_TYPES = [
  { value: 'explicacao',   icon: 'book',      label: 'Explicação',   hint: 'Conteúdo teórico da aula' },
  { value: 'video',        icon: 'video',     label: 'Vídeo',        hint: 'Link de vídeo (YouTube, etc.)' },
  { value: 'questionario', icon: 'clipboard', label: 'Questionário', hint: 'Perguntas com alternativas' },
  { value: 'texto_livre',  icon: 'pencil',    label: 'Texto livre',  hint: 'Anotações ou instruções extras' },
]

function newBlock(type) {
  const base = { id: Date.now() + Math.random(), tipo: type }
  if (type === 'questionario') return { ...base, pergunta: '', alternativas: ['', '', '', ''], correta: 0 }
  return { ...base, conteudo: '' }
}

function BlockExplicacao({ block, onChange, disabled }) {
  return (
    <div className={styles.blockField}>
      <label className={styles.label}>Explicação</label>
      <div className={styles.textareaWrap}>
        <textarea
          className={styles.textarea}
          value={block.conteudo}
          onChange={e => onChange({ ...block, conteudo: e.target.value })}
          placeholder="Escreva o conteúdo teórico aqui. Suporta Markdown."
          rows={8}
          disabled={disabled}
        />
        <span className={styles.charCount}>{block.conteudo.length} caracteres</span>
      </div>
    </div>
  )
}

function BlockVideo({ block, onChange, disabled }) {
  return (
    <div className={styles.blockField}>
      <label className={styles.label}>Link do vídeo</label>
      <input
        className={styles.input}
        value={block.conteudo}
        onChange={e => onChange({ ...block, conteudo: e.target.value })}
        placeholder="https://youtube.com/watch?v=..."
        disabled={disabled}
      />
    </div>
  )
}

function BlockTextoLivre({ block, onChange, disabled }) {
  return (
    <div className={styles.blockField}>
      <label className={styles.label}>Texto livre</label>
      <textarea
        className={`${styles.textarea} ${styles.textareaShort}`}
        value={block.conteudo}
        onChange={e => onChange({ ...block, conteudo: e.target.value })}
        placeholder="Anotações, instruções ou observações extras..."
        rows={4}
        disabled={disabled}
      />
    </div>
  )
}

function BlockQuestionario({ block, onChange, disabled }) {
  function setAlt(i, val) {
    const alternativas = [...block.alternativas]
    alternativas[i] = val
    onChange({ ...block, alternativas })
  }
  function addAlt() { onChange({ ...block, alternativas: [...block.alternativas, ''] }) }
  function removeAlt(i) {
    const alternativas = block.alternativas.filter((_, idx) => idx !== i)
    const correta = block.correta >= alternativas.length ? alternativas.length - 1 : block.correta
    onChange({ ...block, alternativas, correta: Math.max(0, correta) })
  }

  return (
    <div className={styles.blockField}>
      <label className={styles.label}>Pergunta</label>
      <input
        className={styles.input}
        value={block.pergunta}
        onChange={e => onChange({ ...block, pergunta: e.target.value })}
        placeholder="Ex: Qual é a capital do Brasil?"
        disabled={disabled}
      />
      <label className={styles.label} style={{ marginTop: 12 }}>
        Alternativas
        <span className={styles.labelHint}>— clique no círculo para marcar a correta</span>
      </label>
      <div className={styles.altList}>
        {block.alternativas.map((alt, i) => {
          const isCorrect = block.correta === i
          return (
            <div key={i} className={`${styles.altRow} ${isCorrect ? styles.altRowCorrect : ''}`}>
              <button
                type="button"
                className={`${styles.altRadio} ${isCorrect ? styles.altRadioActive : ''}`}
                onClick={() => onChange({ ...block, correta: i })}
                disabled={disabled}
                title="Marcar como correta"
              >
                {isCorrect
                  ? <Icon name="checkCircle" size={15} />
                  : <span className={styles.altLetter}>{String.fromCharCode(65 + i)}</span>}
              </button>
              <input
                className={`${styles.input} ${styles.altInput}`}
                value={alt}
                onChange={e => setAlt(i, e.target.value)}
                placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
                disabled={disabled}
              />
              {isCorrect && <span className={styles.correctBadge}>Correta</span>}
              {block.alternativas.length > 2 && (
                <button type="button" className={styles.altRemove} onClick={() => removeAlt(i)} disabled={disabled}>
                  <Icon name="close" size={12} />
                </button>
              )}
            </div>
          )
        })}
      </div>
      {block.alternativas.length < 6 && (
        <button type="button" className={styles.addAltBtn} onClick={addAlt} disabled={disabled}>
          + Adicionar alternativa
        </button>
      )}
    </div>
  )
}

const BLOCK_COMPONENTS = {
  explicacao:   BlockExplicacao,
  video:        BlockVideo,
  texto_livre:  BlockTextoLivre,
  questionario: BlockQuestionario,
}

const DEFAULT_BLOCKS = [
  { id: 1, tipo: 'explicacao', conteudo: '' },
]

// ── Tour steps ────────────────────────────────────────────────────────────────
// step 0 → título
// step 1 → bloco de explicação (escrever algo)
// step 2 → adicionar bloco
// step 3 → salvar (opcional)

const TOUR_STEPS = [
  {
    ref:      'ref-titulo',
    title:    'Vamos começar pelo nome 📝',
    hint:     'Dê um nome claro para esta aula. Ele é o que o aluno vê primeiro ao entrar na trilha.',
    example:  '"Aula 1 — Introdução ao tema" ou "Equações do 1º Grau"',
    optional: false,
  },
  {
    ref:      'ref-bloco0',
    title:    'Agora escreva o conteúdo ✏️',
    hint:     'Este é o bloco de explicação — o coração da aula. Escreva o que o aluno precisa aprender.',
    example:  'Comece pelos objetivos e depois desenvolva o conteúdo principal.',
    optional: false,
  },
  {
    ref:      'ref-add-menu',
    title:    'Escolha o tipo de bloco 🎥',
    hint:     'Selecione um tipo para adicionar à aula: vídeo, questionário, texto livre ou mais explicação.',
    example:  null,
    optional: false,
  },
  {
    ref:      'ref-salvar',
    title:    'Pronto! Agora é só salvar 🚀',
    hint:     'Clique em "Criar aula" para publicar o conteúdo na sua trilha. Os alunos já poderão acessar.',
    example:  null,
    optional: true,
  },
]

// ── Tour overlay (mesmo padrão do CreateTrilhaModal) ─────────────────────────
function TourOverlay({ tourStep, spotRect, onNext, onSkip, titulo, blocos, addOpen }) {
  if (!spotRect) return null

  const step   = TOUR_STEPS[tourStep]
  const isLast = tourStep === TOUR_STEPS.length - 1

  function canAdvance() {
    if (step.optional) return true
    if (tourStep === 0) return titulo.trim().length > 0
    if (tourStep === 1) return blocos[0]?.conteudo?.trim().length > 0
    if (tourStep === 2) return blocos.length > 1  // só avança após escolher um bloco
    return true
  }

  const below     = spotRect.top + spotRect.height + 16
  const fitsBelow = below + 180 < window.innerHeight
  const tipStyle  = fitsBelow
    ? { top: below,                  left: Math.max(16, Math.min(spotRect.left, window.innerWidth - 316)) }
    : { top: spotRect.top - 190,     left: Math.max(16, Math.min(spotRect.left, window.innerWidth - 316)) }

  return (
    <div className={styles.tourRoot}>
      <svg className={styles.tourOverlaySvg} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="aula-tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={spotRect.left} y={spotRect.top} width={spotRect.width} height={spotRect.height} rx="12" fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.72)" mask="url(#aula-tour-mask)" />
      </svg>

      <div className={styles.tourSpotBorder} style={{ top: spotRect.top, left: spotRect.left, width: spotRect.width, height: spotRect.height }} />

      <div className={styles.tourTooltip} style={tipStyle}>
        <div className={styles.tourTooltipHead}>
          <span className={styles.tourBadge}>{tourStep + 1} / {TOUR_STEPS.length}</span>
          {step.optional && <span className={styles.tourOptional}>opcional</span>}
          <button className={styles.tourSkip} onClick={onSkip} type="button">Pular tour</button>
        </div>

        <h4 className={styles.tourTitle}>{step.title}</h4>
        <p className={styles.tourHint}>{step.hint}</p>
        {step.example && <p className={styles.tourExample}>{step.example}</p>}

        <div className={styles.tourNav}>
          <div className={styles.tourDots}>
            {TOUR_STEPS.map((_, i) => (
              <span key={i} className={`${styles.tourDot} ${i === tourStep ? styles.tourDotActive : i < tourStep ? styles.tourDotDone : ''}`} />
            ))}
          </div>
          <button type="button" className={styles.tourNextBtn} onClick={onNext} disabled={!canAdvance()}>
            {isLast ? 'Concluir ✓' : 'Próximo →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Editor principal ──────────────────────────────────────────────────────────
export default function AulaEditor({ initialData = null, onSave, onCancel, saving, forceTour = false }) {
  const isEdit = initialData !== null

  const [tourStep, setTourStep] = useState(() => {
    if (isEdit) return -1
    if (forceTour) return 0
    try { return localStorage.getItem(AULA_TOUR_KEY) !== 'true' ? 0 : -1 } catch { return -1 }
  })

  const tourActive  = tourStep >= 0 && tourStep < TOUR_STEPS.length
  const currentStep = tourActive ? TOUR_STEPS[tourStep] : null

  const [titulo,  setTitulo]  = useState(initialData?.titulo  ?? '')
  const [blocos,  setBlocos]  = useState(initialData?.blocos  ?? DEFAULT_BLOCKS)
  const [error,   setError]   = useState('')
  const [addOpen, setAddOpen] = useState(false)

  // refs para spotlight
  const refTitulo   = useRef(null)
  const refBloco0   = useRef(null)
  const refAddBloco = useRef(null)
  const refAddMenu  = useRef(null)
  const refSalvar   = useRef(null)

  const refMap = {
    'ref-titulo':    refTitulo,
    'ref-bloco0':    refBloco0,
    'ref-add-bloco': refAddBloco,
    'ref-add-menu':  refAddMenu,
    'ref-salvar':    refSalvar,
  }

  const [spotRect, setSpotRect] = useState(null)

  const measureSpot = useCallback(() => {
    if (!currentStep) return
    const el = refMap[currentStep.ref]?.current
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    setTimeout(() => {
      const r = el.getBoundingClientRect()
      setSpotRect({ top: r.top - 8, left: r.left - 8, width: r.width + 16, height: r.height + 16 })
    }, 140)
  }, [currentStep]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!tourActive) { setSpotRect(null); return }
    setSpotRect(null)
    // passo 2: abre o menu automaticamente para o spotlight poder medir
    if (tourStep === 2) {
      setAddOpen(true)
      setTimeout(() => measureSpot(), 180)
    } else {
      setAddOpen(false)
      measureSpot()
    }
  }, [tourStep, tourActive, measureSpot])

  useEffect(() => {
    if (!tourActive) return
    const h = () => measureSpot()
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [tourActive, measureSpot])

  function tourNext() {
    if (tourStep < TOUR_STEPS.length - 1) setTourStep(s => s + 1)
    else finishTour()
    setAddOpen(false)
  }

  function finishTour() {
    try { localStorage.setItem(AULA_TOUR_KEY, 'true') } catch {}
    setTourStep(-1)
  }

  // bloqueia interação fora do campo atual durante o tour
  function isDisabled(field) {
    if (!tourActive) return saving
    return currentStep?.ref !== field
  }

  // no tour, o número do passo que libera os botões de salvar/cancelar
  const SAVE_STEP = TOUR_STEPS.length - 1

  function updateBlock(id, updated) { setBlocos(prev => prev.map(b => b.id === id ? updated : b)) }
  function removeBlock(id)          { setBlocos(prev => prev.filter(b => b.id !== id)) }

  function addBlock(type) {
    setBlocos(prev => [...prev, newBlock(type)])
    setAddOpen(false)
    // no passo 2 do tour, avança automaticamente para o próximo passo
    if (tourActive && tourStep === 2) setTourStep(3)
  }

  function moveBlock(id, dir) {
    setBlocos(prev => {
      const idx  = prev.findIndex(b => b.id === id)
      const next = [...prev]
      const swap = idx + dir
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  async function handleSubmit() {
    if (!titulo.trim()) { setError('O título é obrigatório.'); return }
    if (blocos.length === 0) { setError('Adicione ao menos um bloco de conteúdo.'); return }
    setError('')
    try { await onSave({ titulo: titulo.trim(), blocos }) }
    catch (err) { setError(err.message || 'Erro ao salvar aula.') }
  }

  return (
    <>
      {tourActive && (
        <TourOverlay
          tourStep={tourStep}
          spotRect={spotRect}
          onNext={tourNext}
          onSkip={finishTour}
          titulo={titulo}
          blocos={blocos}
          addOpen={addOpen}
        />
      )}

      <div className={styles.editor}>
        <div className={styles.editorHeader}>
          <h3 className={styles.editorTitle}>
            <Icon name={isEdit ? 'pencil' : 'fileText'} size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
            {isEdit ? 'Editar aula' : tourActive ? 'Vamos criar sua primeira aula! 🎉' : 'Nova aula'}
          </h3>
          <span className={styles.editorHint}>
            {tourActive
              ? [
                  'Primeiro, dê um nome para a aula.',
                  'Agora escreva o que o aluno vai aprender.',
                  'Escolha um tipo de bloco para adicionar.',
                  'Tudo certo! Salve a aula quando quiser.',
                ][tourStep]
              : 'Monte a aula adicionando blocos de conteúdo.'}
          </span>
        </div>

        {/* Título */}
        <div className={styles.field} ref={refTitulo}>
          <label className={styles.label}>Título da aula</label>
          <input
            className={styles.input}
            value={titulo}
            onChange={e => { setTitulo(e.target.value); setError('') }}
            placeholder="Ex: Aula 1 — Introdução"
            disabled={isDisabled('ref-titulo') || saving}
            autoFocus={!tourActive || tourStep === 0}
          />
        </div>

        {/* Blocos */}
        <div className={styles.blockList}>
          {blocos.map((block, idx) => {
            const BlockComp = BLOCK_COMPONENTS[block.tipo]
            const meta      = BLOCK_TYPES.find(t => t.value === block.tipo)
            const isFirst   = idx === 0
            return (
              <div
                key={block.id}
                className={styles.block}
                ref={isFirst ? refBloco0 : undefined}
              >
                <div className={styles.blockHeader}>
                  <span className={styles.blockLabel}>
                    {meta && <Icon name={meta.icon} size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />}
                    {meta?.label}
                  </span>
                  <span className={styles.blockHint}>{meta?.hint}</span>
                  <div className={styles.blockControls}>
                    <button type="button" className={styles.blockCtrlBtn} onClick={() => moveBlock(block.id, -1)} disabled={idx === 0 || saving || (tourActive && tourStep < 3)} title="Mover para cima">
                      <Icon name="chevronRight" size={13} style={{ transform: 'rotate(-90deg)' }} />
                    </button>
                    <button type="button" className={styles.blockCtrlBtn} onClick={() => moveBlock(block.id, 1)} disabled={idx === blocos.length - 1 || saving || (tourActive && tourStep < 3)} title="Mover para baixo">
                      <Icon name="chevronRight" size={13} style={{ transform: 'rotate(90deg)' }} />
                    </button>
                    <button type="button" className={`${styles.blockCtrlBtn} ${styles.blockRemove}`} onClick={() => removeBlock(block.id)} disabled={saving || (tourActive && tourStep < 3)} title="Remover bloco">
                      <Icon name="close" size={13} />
                    </button>
                  </div>
                </div>
                {BlockComp && (
                  <BlockComp
                    block={block}
                    onChange={updated => updateBlock(block.id, updated)}
                    disabled={saving || (tourActive && isFirst ? isDisabled('ref-bloco0') : tourActive && tourStep < 3)}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Adicionar bloco */}
        <div className={styles.addBlockWrap} ref={refAddBloco}>
          {addOpen ? (
            <div className={styles.addBlockMenu} ref={refAddMenu}>
              {BLOCK_TYPES.map(t => (
                <button key={t.value} type="button" className={styles.addBlockOption} onClick={() => addBlock(t.value)}>
                  <span>
                    <Icon name={t.icon} size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                    {t.label}
                  </span>
                  <span className={styles.addBlockOptionHint}>{t.hint}</span>
                </button>
              ))}
              {!tourActive && (
                <button type="button" className={styles.addBlockCancel} onClick={() => setAddOpen(false)}>Cancelar</button>
              )}
            </div>
          ) : (
            <button
              type="button"
              className={styles.addBlockBtn}
              onClick={() => setAddOpen(true)}
              disabled={saving || (tourActive && tourStep !== 2)}
            >
              + Adicionar bloco
            </button>
          )}
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <div className={styles.actions} ref={refSalvar}>
          <button className={styles.cancelBtn} onClick={onCancel} disabled={saving || (tourActive && tourStep < SAVE_STEP)} type="button">Cancelar</button>
          <button
            className={styles.saveBtn}
            onClick={handleSubmit}
            disabled={saving || (tourActive && tourStep < SAVE_STEP)}
            type="button"
          >
            {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar aula'}
          </button>
        </div>
      </div>
    </>
  )
}
