import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import { MOCK_TRILHAS } from '../data/mockTrilhas'
import styles from './StudentTrilhaPage.module.css'

const SUBJECT_EMOJI = {
  Matemática: '📐', Português: '📖', Química: '⚗️', Biologia: '🧬',
  Física: '⚡', Geografia: '🌍', História: '📜', Inglês: '🌐',
}

const NIVEL_COLOR = {
  Básico:        { color: '#22c55e', bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.3)'  },
  Intermediário: { color: '#f59e0b', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)' },
  Avançado:      { color: '#ef4444', bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.3)'  },
}

// ── Modal de exercício ────────────────────────────────────────────────────────
function ExercicioModal({ ex, isDone, onConcluir, onClose, onProximo, temProximo }) {
  const [selecionada, setSelecionada] = useState(null)   // id da alternativa
  const [resultado,   setResultado]   = useState(null)   // 'certo' | 'errado' | null

  // Se já concluído, mostra direto o estado de acerto
  const jaRespondido = isDone

  function handleResponder() {
    if (!selecionada) return
    const alt = ex.alternativas.find(a => a.id === selecionada)
    if (alt?.correta) {
      setResultado('certo')
      onConcluir(ex.id)
    } else {
      setResultado('errado')
    }
  }

  function handleTentarNovamente() {
    setSelecionada(null)
    setResultado(null)
  }

  const acertou = resultado === 'certo' || jaRespondido

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* ── Cabeçalho ── */}
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.modalTag}>Exercício</span>
            <h2 className={styles.modalTitle}>{ex.titulo}</h2>
          </div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>

          {/* ── Explicação ── */}
          <div className={styles.explicacao}>
            <p className={styles.explicacaoLabel}>📖 Explicação</p>
            <p className={styles.explicacaoText}>{ex.explicacao}</p>
          </div>

          {/* ── Pergunta ── */}
          <div className={styles.perguntaBox}>
            <p className={styles.perguntaLabel}>❓ Questão</p>
            <p className={styles.perguntaText}>{ex.pergunta}</p>
          </div>

          {/* ── Alternativas ── */}
          {!acertou && (
            <div className={styles.alternativas}>
              {ex.alternativas.map(alt => {
                const sel = selecionada === alt.id
                const erradaSel = resultado === 'errado' && sel
                return (
                  <button
                    key={alt.id}
                    className={`${styles.alt}
                      ${sel        ? styles.altSel    : ''}
                      ${erradaSel  ? styles.altErrada : ''}
                    `}
                    onClick={() => resultado !== 'errado' && setSelecionada(alt.id)}
                    disabled={resultado === 'errado' && !sel}
                  >
                    <span className={styles.altLetra}>{alt.id.toUpperCase()}</span>
                    <span className={styles.altTexto}>{alt.texto}</span>
                    {sel && <span className={styles.altCheck}>{resultado === 'errado' ? '✕' : '●'}</span>}
                  </button>
                )
              })}
            </div>
          )}

          {/* ── Gabarito (após acerto) ── */}
          {acertou && (
            <div className={styles.alternativasGabarito}>
              {ex.alternativas.map(alt => (
                <div
                  key={alt.id}
                  className={`${styles.alt} ${alt.correta ? styles.altCorreta : styles.altNeutral}`}
                >
                  <span className={styles.altLetra}>{alt.id.toUpperCase()}</span>
                  <span className={styles.altTexto}>{alt.texto}</span>
                  {alt.correta && <span className={styles.altCheck}>✓</span>}
                </div>
              ))}
            </div>
          )}

          {/* ── Feedback ── */}
          {resultado === 'errado' && (
            <div className={styles.feedbackErrado}>
              <span>✕</span>
              <div>
                <p className={styles.feedbackTitle}>Resposta incorreta, tente novamente!</p>
                <p className={styles.feedbackSub}>Releia a explicação e escolha outra alternativa.</p>
              </div>
              <button className={styles.btnTentar} onClick={handleTentarNovamente}>
                Tentar novamente
              </button>
            </div>
          )}

          {acertou && (
            <div className={styles.feedbackCerto}>
              <span>✓</span>
              <div>
                <p className={styles.feedbackTitle}>Resposta correta! Exercício concluído.</p>
                <p className={styles.feedbackSub}>Ótimo trabalho! Continue assim.</p>
              </div>
            </div>
          )}

          {/* ── Ações ── */}
          <div className={styles.modalActions}>
            {!acertou && resultado !== 'errado' && (
              <button
                className={styles.btnResponder}
                onClick={handleResponder}
                disabled={!selecionada}
              >
                Responder
              </button>
            )}

            {acertou && temProximo && (
              <button className={styles.btnProximo} onClick={onProximo}>
                Próximo exercício →
              </button>
            )}

            {acertou && !temProximo && (
              <button className={styles.btnProximo} onClick={onClose}>
                Concluir trilha 🎉
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function StudentTrilhaPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const trilha = MOCK_TRILHAS.find(t => t.id === id)
  const [concluidos, setConcluidos] = useState(new Set())
  const [modalIdx,   setModalIdx]   = useState(null)   // índice do exercício aberto

  if (!trilha) {
    return (
      <DashboardLayout>
        <div className={styles.empty}>
          <span>⚠️</span>
          <p>Trilha não encontrada.</p>
          <button className={styles.btnBack} onClick={() => navigate('/dashboard')}>← Voltar</button>
        </div>
      </DashboardLayout>
    )
  }

  const total = trilha.exercicios.length
  const done  = concluidos.size
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100)
  const nivel = NIVEL_COLOR[trilha.nivel] ?? NIVEL_COLOR['Básico']
  const emoji = SUBJECT_EMOJI[trilha.disciplina] ?? '📚'

  function handleConcluir(exId) {
    setConcluidos(prev => new Set([...prev, exId]))
  }

  function handleProximo() {
    const next = modalIdx + 1
    if (next < total) setModalIdx(next)
    else setModalIdx(null)
  }

  const modalEx = modalIdx !== null ? trilha.exercicios[modalIdx] : null

  return (
    <DashboardLayout>
      <div className={styles.container}>

        {/* ── BACK ── */}
        <button className={styles.btnBack} onClick={() => navigate('/dashboard')}>
          ← Voltar às trilhas
        </button>

        {/* ── HEADER ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerEmoji}>{emoji}</span>
            <div className={styles.headerInfo}>
              <div className={styles.headerTop}>
                <h1 className={styles.title}>{trilha.nome}</h1>
                <span
                  className={styles.nivelBadge}
                  style={{ color: nivel.color, background: nivel.bg, borderColor: nivel.border }}
                >
                  {trilha.nivel}
                </span>
              </div>
              <p className={styles.professor}>👨🏫 {trilha.professorNome}</p>
              {trilha.descricao && <p className={styles.desc}>{trilha.descricao}</p>}
            </div>
          </div>
        </div>

        {/* ── PROGRESSO ── */}
        <div className={styles.progressCard}>
          <div className={styles.progressRow}>
            <div>
              <p className={styles.progressLabel}>Seu progresso</p>
              <p className={styles.progressText}>
                {pct === 100
                  ? '🎉 Parabéns! Você concluiu toda a trilha!'
                  : `Você concluiu ${done} de ${total} exercício${total !== 1 ? 's' : ''}`}
              </p>
            </div>
            <span className={styles.progressPct}>{pct}%</span>
          </div>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* ── MÓDULO 1 ── */}
        <section className={styles.section}>
          <div className={styles.moduleHeader}>
            <span className={styles.moduleTag}>Módulo 1</span>
            <h2 className={styles.moduleTitle}>Exercícios</h2>
            <p className={styles.moduleSub}>{total} exercício{total !== 1 ? 's' : ''} neste módulo</p>
          </div>

          <div className={styles.exList}>
            {trilha.exercicios.map((ex, i) => {
              const isDone = concluidos.has(ex.id)
              return (
                <div key={ex.id} className={`${styles.exCard} ${isDone ? styles.exCardDone : ''}`}>
                  <div className={styles.exLeft}>
                    <span className={`${styles.exNum} ${isDone ? styles.exNumDone : ''}`}>
                      {isDone ? '✓' : i + 1}
                    </span>
                    <div>
                      <p className={styles.exTitle}>{ex.titulo}</p>
                      {isDone
                        ? <span className={styles.doneTag}>Concluído</span>
                        : <span className={styles.pendingTag}>Pendente</span>
                      }
                    </div>
                  </div>
                  <button
                    className={isDone ? styles.btnReabrir : styles.btnAbrir}
                    onClick={() => setModalIdx(i)}
                  >
                    {isDone ? 'Rever exercício' : 'Abrir exercício →'}
                  </button>
                </div>
              )
            })}
          </div>
        </section>

      </div>

      {/* ── MODAL ── */}
      {/* key={modalIdx} força remontagem completa ao trocar de exercício,
          garantindo que selecionada/resultado sejam resetados */}
      {modalEx && (
        <ExercicioModal
          key={modalIdx}
          ex={modalEx}
          isDone={concluidos.has(modalEx.id)}
          onConcluir={handleConcluir}
          onClose={() => setModalIdx(null)}
          onProximo={handleProximo}
          temProximo={modalIdx + 1 < total}
        />
      )}
    </DashboardLayout>
  )
}
