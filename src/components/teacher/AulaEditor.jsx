import { useState } from 'react'
import styles from './AulaEditor.module.css'

// ── Tipos de bloco (futuro enum no backend) ───────────────────────────────────
const BLOCK_TYPES = [
  { value: 'explicacao',    label: '📖 Explicação',    hint: 'Conteúdo teórico da aula' },
  { value: 'video',         label: '🎥 Vídeo',         hint: 'Link de vídeo (YouTube, etc.)' },
  { value: 'questionario',  label: '❓ Questionário',  hint: 'Perguntas com alternativas' },
  { value: 'texto_livre',   label: '✏️ Texto livre',   hint: 'Anotações ou instruções extras' },
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
  function addAlt() {
    onChange({ ...block, alternativas: [...block.alternativas, ''] })
  }
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
      <label className={styles.label} style={{ marginTop: 12 }}>Alternativas <span className={styles.labelHint}>(marque a correta)</span></label>
      <div className={styles.altList}>
        {block.alternativas.map((alt, i) => (
          <div key={i} className={styles.altRow}>
            <button
              type="button"
              className={`${styles.altRadio} ${block.correta === i ? styles.altRadioActive : ''}`}
              onClick={() => onChange({ ...block, correta: i })}
              disabled={disabled}
              title="Marcar como correta"
            >
              {block.correta === i ? '✅' : '⬜'}
            </button>
            <input
              className={`${styles.input} ${styles.altInput}`}
              value={alt}
              onChange={e => setAlt(i, e.target.value)}
              placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
              disabled={disabled}
            />
            {block.alternativas.length > 2 && (
              <button type="button" className={styles.altRemove} onClick={() => removeAlt(i)} disabled={disabled}>✕</button>
            )}
          </div>
        ))}
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

// ── Template padrão ───────────────────────────────────────────────────────────
const DEFAULT_BLOCKS = [
  { id: 1, tipo: 'explicacao', conteudo: '## Objetivos\nAo final desta aula, o aluno será capaz de:\n- Compreender os conceitos fundamentais\n- Aplicar o conhecimento em situações práticas\n\n## Conteúdo\nEscreva aqui o conteúdo principal...' },
  { id: 2, tipo: 'questionario', pergunta: '', alternativas: ['', '', '', ''], correta: 0 },
]

export default function AulaEditor({ initialData = null, onSave, onCancel, saving }) {
  const isEdit = initialData !== null

  const [titulo,  setTitulo]  = useState(initialData?.titulo  ?? 'Aula 1 — Introdução ao tema')
  const [blocos,  setBlocos]  = useState(initialData?.blocos  ?? DEFAULT_BLOCKS)
  const [error,   setError]   = useState('')
  const [addOpen, setAddOpen] = useState(false)

  function updateBlock(id, updated) {
    setBlocos(prev => prev.map(b => b.id === id ? updated : b))
  }

  function removeBlock(id) {
    setBlocos(prev => prev.filter(b => b.id !== id))
  }

  function addBlock(type) {
    setBlocos(prev => [...prev, newBlock(type)])
    setAddOpen(false)
  }

  function moveBlock(id, dir) {
    setBlocos(prev => {
      const idx = prev.findIndex(b => b.id === id)
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
    try {
      await onSave({ titulo: titulo.trim(), blocos })
    } catch (err) {
      setError(err.message || 'Erro ao salvar aula.')
    }
  }

  return (
    <div className={styles.editor}>
      <div className={styles.editorHeader}>
        <h3 className={styles.editorTitle}>{isEdit ? '✏️ Editar aula' : '📝 Nova aula'}</h3>
        <span className={styles.editorHint}>Monte a aula adicionando blocos de conteúdo.</span>
      </div>

      {/* Título */}
      <div className={styles.field}>
        <label className={styles.label}>Título da aula</label>
        <input
          className={styles.input}
          value={titulo}
          onChange={e => { setTitulo(e.target.value); setError('') }}
          placeholder="Ex: Aula 1 — Introdução"
          disabled={saving}
          autoFocus
        />
      </div>

      {/* Blocos */}
      <div className={styles.blockList}>
        {blocos.map((block, idx) => {
          const BlockComp = BLOCK_COMPONENTS[block.tipo]
          const meta = BLOCK_TYPES.find(t => t.value === block.tipo)
          return (
            <div key={block.id} className={styles.block}>
              <div className={styles.blockHeader}>
                <span className={styles.blockLabel}>{meta?.label}</span>
                <span className={styles.blockHint}>{meta?.hint}</span>
                <div className={styles.blockControls}>
                  <button type="button" className={styles.blockCtrlBtn} onClick={() => moveBlock(block.id, -1)} disabled={idx === 0 || saving} title="Mover para cima">↑</button>
                  <button type="button" className={styles.blockCtrlBtn} onClick={() => moveBlock(block.id, 1)} disabled={idx === blocos.length - 1 || saving} title="Mover para baixo">↓</button>
                  <button type="button" className={`${styles.blockCtrlBtn} ${styles.blockRemove}`} onClick={() => removeBlock(block.id)} disabled={saving} title="Remover bloco">✕</button>
                </div>
              </div>
              {BlockComp && <BlockComp block={block} onChange={updated => updateBlock(block.id, updated)} disabled={saving} />}
            </div>
          )
        })}
      </div>

      {/* Adicionar bloco */}
      <div className={styles.addBlockWrap}>
        {addOpen ? (
          <div className={styles.addBlockMenu}>
            {BLOCK_TYPES.map(t => (
              <button key={t.value} type="button" className={styles.addBlockOption} onClick={() => addBlock(t.value)}>
                <span>{t.label}</span>
                <span className={styles.addBlockOptionHint}>{t.hint}</span>
              </button>
            ))}
            <button type="button" className={styles.addBlockCancel} onClick={() => setAddOpen(false)}>Cancelar</button>
          </div>
        ) : (
          <button type="button" className={styles.addBlockBtn} onClick={() => setAddOpen(true)} disabled={saving}>
            + Adicionar bloco
          </button>
        )}
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onCancel} disabled={saving} type="button">Cancelar</button>
        <button className={styles.saveBtn} onClick={handleSubmit} disabled={saving} type="button">
          {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar aula'}
        </button>
      </div>
    </div>
  )
}
