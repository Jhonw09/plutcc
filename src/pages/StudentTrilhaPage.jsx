import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import { getTrilhaById } from '../api/services/trilhaService'
import { getAulasByTrilha } from '../api/services/aulaService'
import styles from './StudentTrilhaPage.module.css'

const SUBJECT_EMOJI = {
  Matemática: '📐', Português: '📖', Química: '⚗️', Biologia: '🧬',
  Física: '⚡', Geografia: '🌍', História: '📜', Inglês: '🌐',
}

const NIVEL_COLOR = {
  Básico:        { color: '#22c55e', bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.3)'  },
  Intermediário: { color: '#f59e0b', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)' },
  Avançado:      { color: '#ef4444', bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.3)'  },
  BASICO:        { color: '#22c55e', bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.3)'  },
  INTERMEDIARIO: { color: '#f59e0b', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)' },
  AVANCADO:      { color: '#ef4444', bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.3)'  },
}

// ── Modal de exercício ────────────────────────────────────────────────────────
// Recebe um bloco do tipo 'questionario' e renderiza a questão interativa.
function ExercicioModal({ ex, isDone, onConcluir, onClose, onProximo, temProximo }) {
  const [selecionada, setSelecionada] = useState(null)
  const [resultado,   setResultado]   = useState(null)

  const acertou = resultado === 'certo' || isDone

  function handleResponder() {
    if (!selecionada) return
    const alt = ex.alternativas.find(a => a.id === selecionada)
    if (alt?.correta) { setResultado('certo'); onConcluir(ex.id) }
    else setResultado('errado')
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={styles.modalHeader}>
          <div>
            <span className={styles.modalTag}>Exercício</span>
            <h2 className={styles.modalTitle}>{ex.titulo}</h2>
          </div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>

          {ex.explicacao && (
            <div className={styles.explicacao}>
              <p className={styles.explicacaoLabel}>📖 Explicação</p>
              <p className={styles.explicacaoText}>{ex.explicacao}</p>
            </div>
          )}

          <div className={styles.perguntaBox}>
            <p className={styles.perguntaLabel}>❓ Questão</p>
            <p className={styles.perguntaText}>{ex.pergunta}</p>
          </div>

          {!acertou && (
            <div className={styles.alternativas}>
              {ex.alternativas.map(alt => {
                const sel = selecionada === alt.id
                const erradaSel = resultado === 'errado' && sel
                return (
                  <button
                    key={alt.id}
                    className={`${styles.alt} ${sel ? styles.altSel : ''} ${erradaSel ? styles.altErrada : ''}`}
                    onClick={() => resultado !== 'errado' && setSelecionada(alt.id)}
                    disabled={resultado === 'errado' && !sel}
                  >
                    <span className={styles.altLetra}>{String(alt.id).toUpperCase()}</span>
                    <span className={styles.altTexto}>{alt.texto}</span>
                    {sel && <span className={styles.altCheck}>{resultado === 'errado' ? '✕' : '●'}</span>}
                  </button>
                )
              })}
            </div>
          )}

          {acertou && (
            <div className={styles.alternativasGabarito}>
              {ex.alternativas.map(alt => (
                <div key={alt.id} className={`${styles.alt} ${alt.correta ? styles.altCorreta : styles.altNeutral}`}>
                  <span className={styles.altLetra}>{String(alt.id).toUpperCase()}</span>
                  <span className={styles.altTexto}>{alt.texto}</span>
                  {alt.correta && <span className={styles.altCheck}>✓</span>}
                </div>
              ))}
            </div>
          )}

          {resultado === 'errado' && (
            <div className={styles.feedbackErrado}>
              <span>✕</span>
              <div>
                <p className={styles.feedbackTitle}>Resposta incorreta, tente novamente!</p>
                <p className={styles.feedbackSub}>Releia a explicação e escolha outra alternativa.</p>
              </div>
              <button className={styles.btnTentar} onClick={() => { setSelecionada(null); setResultado(null) }}>
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

          <div className={styles.modalActions}>
            {!acertou && resultado !== 'errado' && (
              <button className={styles.btnResponder} onClick={handleResponder} disabled={!selecionada}>
                Responder
              </button>
            )}
            {acertou && temProximo && (
              <button className={styles.btnProximo} onClick={onProximo}>Próximo exercício →</button>
            )}
            {acertou && !temProximo && (
              <button className={styles.btnProximo} onClick={onClose}>Concluir trilha 🎉</button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Adapta blocos de aula da API → formato de exercício que o modal espera ──
// Pega o primeiro bloco 'questionario' de cada aula como exercício.
function aulaToExercicio(aula) {
  const q = aula.blocos?.find(b => b.tipo === 'questionario')
  if (!q) return null
  return {
    id:           aula.id,
    titulo:       aula.titulo,
    explicacao:   aula.blocos?.find(b => b.tipo === 'explicacao')?.conteudo ?? '',
    pergunta:     q.pergunta ?? '',
    alternativas: Array.isArray(q.alternativas)
      ? q.alternativas.map((texto, i) => ({
          id:     String.fromCharCode(97 + i), // 'a', 'b', 'c'...
          texto:  typeof texto === 'string' ? texto : texto.texto,
          correta: i === q.correta || texto?.correta === true,
        }))
      : [],
  }
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function StudentTrilhaPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [trilha,     setTrilha]     = useState(null)
  const [exercicios, setExercicios] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [concluidos, setConcluidos] = useState(new Set())
  const [modalIdx,   setModalIdx]   = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [trilhaData, aulas] = await Promise.all([
          getTrilhaById(id),
          getAulasByTrilha(id),
        ])
        setTrilha(trilhaData)
        setExercicios(aulas.map(aulaToExercicio).filter(Boolean))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.empty}>
          <span>⏳</span><p>Carregando trilha...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !trilha) {
    return (
      <DashboardLayout>
        <div className={styles.empty}>
          <span>⚠️</span>
          <p>{error ?? 'Trilha não encontrada.'}</p>
          <button className={styles.btnBack} onClick={() => navigate('/dashboard')}>← Voltar</button>
        </div>
      </DashboardLayout>
    )
  }

  const total = exercicios.length
  const done  = concluidos.size
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100)
  const nivel = NIVEL_COLOR[trilha.nivel] ?? NIVEL_COLOR['Básico']
  const emoji = SUBJECT_EMOJI[trilha.disciplina] ?? '📚'
  const modalEx = modalIdx !== null ? exercicios[modalIdx] : null

  return (
    <DashboardLayout>
      <div className={styles.container}>

        <button className={styles.btnBack} onClick={() => navigate('/dashboard')}>
          ← Voltar às trilhas
        </button>

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerEmoji}>{emoji}</span>
            <div className={styles.headerInfo}>
              <div className={styles.headerTop}>
                <h1 className={styles.title}>{trilha.nome}</h1>
                <span className={styles.nivelBadge} style={{ color: nivel.color, background: nivel.bg, borderColor: nivel.border }}>
                  {trilha.nivel}
                </span>
              </div>
              {trilha.professorNome && <p className={styles.professor}>👨🏫 {trilha.professorNome}</p>}
              {trilha.descricao && <p className={styles.desc}>{trilha.descricao}</p>}
            </div>
          </div>
        </div>

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

        <section className={styles.section}>
          <div className={styles.moduleHeader}>
            <span className={styles.moduleTag}>Módulo 1</span>
            <h2 className={styles.moduleTitle}>Exercícios</h2>
            <p className={styles.moduleSub}>{total} exercício{total !== 1 ? 's' : ''} neste módulo</p>
          </div>

          {total === 0 ? (
            <p style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>
              Esta trilha ainda não tem exercícios.
            </p>
          ) : (
            <div className={styles.exList}>
              {exercicios.map((ex, i) => {
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
                          : <span className={styles.pendingTag}>Pendente</span>}
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
          )}
        </section>

      </div>

      {modalEx && (
        <ExercicioModal
          key={modalIdx}
          ex={modalEx}
          isDone={concluidos.has(modalEx.id)}
          onConcluir={id => setConcluidos(prev => new Set([...prev, id]))}
          onClose={() => setModalIdx(null)}
          onProximo={() => { const n = modalIdx + 1; n < total ? setModalIdx(n) : setModalIdx(null) }}
          temProximo={modalIdx + 1 < total}
        />
      )}
    </DashboardLayout>
  )
}
