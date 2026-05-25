import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import { getTrilhaById } from '../api/services/trilhaService'
import { getAulasByTrilha } from '../api/services/aulaService'
import { useTrilhasAluno } from '../hooks/useTrilhasAluno'
import { useMatricula } from '../hooks/useMatricula'
import Icon from '../components/ui/Icon'
import styles from './StudentTrilhaPage.module.css'

const SUBJECT_ICON = {
  Matemática: 'math', Português: 'book', Química: 'flask', Biologia: 'dna',
  Física: 'zap', Geografia: 'globe', História: 'scroll', Inglês: 'globe',
  Artes: 'palette', Informática: 'monitor', Filosofia: 'brain', Sociologia: 'scale',
}

const NIVEL_COLOR = {
  Básico:        { color: '#22c55e', bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.3)'  },
  Intermediário: { color: '#f59e0b', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)' },
  Avançado:      { color: '#ef4444', bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.3)'  },
  BASICO:        { color: '#22c55e', bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.3)'  },
  INTERMEDIARIO: { color: '#f59e0b', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)' },
  AVANCADO:      { color: '#ef4444', bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.3)'  },
}

const TIPO_ICON = { video: 'video', texto: 'fileText', questionario: 'clipboard', explicacao: 'book', texto_livre: 'pencil' }

function aulaTipo(aula) {
  if (aula.blocos?.some(b => b.tipo === 'questionario')) return 'questionario'
  if (aula.blocos?.some(b => b.tipo === 'video'))        return 'video'
  return 'texto'
}

// ── Modal de conteúdo (aulas sem questionário) ────────────────────────────────
function AulaConteudoModal({ aula, isDone, onConcluir, onClose }) {
  const blocos = aula.blocos ?? []

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={styles.modalHeader}>
          <div>
            <span className={styles.modalTag}>Aula</span>
            <h2 className={styles.modalTitle}>{aula.titulo}</h2>
          </div>
          <button className={styles.modalClose} onClick={onClose}>
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {blocos.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Esta aula ainda não tem conteúdo.
            </p>
          )}

          {blocos.map((bloco, i) => (
            <div key={i} className={styles.blocoWrap}>
              {bloco.tipo === 'explicacao' && (
                <div className={styles.blocoExplicacao}>
                  <p className={styles.blocoLabel}>Explicação</p>
                  <p className={styles.blocoTexto}>{bloco.conteudo}</p>
                </div>
              )}
              {bloco.tipo === 'texto_livre' && (
                <div className={styles.blocoTextoLivre}>
                  <p className={styles.blocoTexto}>{bloco.conteudo}</p>
                </div>
              )}
              {bloco.tipo === 'video' && bloco.url && (
                <div className={styles.blocoVideo}>
                  <p className={styles.blocoLabel}>Vídeo</p>
                  <a href={bloco.url} target="_blank" rel="noreferrer" className={styles.videoLink}>
                    Assistir vídeo
                  </a>
                </div>
              )}
            </div>
          ))}

          <div className={styles.modalActions}>
            {!isDone ? (
              <button className={styles.btnResponder} onClick={() => { onConcluir(); onClose() }}>
                Marcar como concluída
              </button>
            ) : (
              <div className={styles.feedbackCerto}>
                <Icon name="checkCircle" size={16} />
                <div>
                  <p className={styles.feedbackTitle}>Aula concluída!</p>
                  <p className={styles.feedbackSub}>Ótimo trabalho. Continue assim.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modal de exercício ────────────────────────────────────────────────────────
function ExercicioModal({ ex, isDone, onConcluir, onClose, onProximo, temProximo }) {
  const [selecionada, setSelecionada] = useState(null)
  const [resultado,   setResultado]   = useState(null)

  const acertou = resultado === 'certo' || isDone

  function handleResponder() {
    if (!selecionada) return
    const alt = ex.alternativas.find(a => a.id === selecionada)
    if (alt?.correta) { setResultado('certo'); onConcluir() }
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
          <button className={styles.modalClose} onClick={onClose}>
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {ex.explicacao && (
            <div className={styles.explicacao}>
              <p className={styles.explicacaoLabel}>Explicação</p>
              <p className={styles.explicacaoText}>{ex.explicacao}</p>
            </div>
          )}

          <div className={styles.perguntaBox}>
            <p className={styles.perguntaLabel}>Questão</p>
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
                    {sel && <span className={styles.altCheck}>{resultado === 'errado' ? <Icon name="close" size={13}/> : '●'}</span>}
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
                  {alt.correta && <span className={styles.altCheck}><Icon name="check" size={13}/></span>}
                </div>
              ))}
            </div>
          )}

          {resultado === 'errado' && (
            <div className={styles.feedbackErrado}>
              <Icon name="close" size={16} />
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
              <Icon name="checkCircle" size={16} />
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
              <button className={styles.btnProximo} onClick={onClose}>Concluir trilha</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

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
          id:      String.fromCharCode(97 + i),
          texto:   typeof texto === 'string' ? texto : texto.texto,
          correta: i === q.correta || texto?.correta === true,
        }))
      : [],
  }
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function StudentTrilhaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { concluirAula, concluidasSet } = useTrilhasAluno()
  const { matriculado, loadingCheck } = useMatricula(id)

  const [trilha,  setTrilha]  = useState(null)
  const [aulas,   setAulas]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const [modal, setModal] = useState(null)

  useEffect(() => {
    if (!loadingCheck && !matriculado) {
      navigate(`/dashboard/trilha-detalhe/${id}`, { replace: true })
      return
    }
    async function load() {
      try {
        const trilhaData = await getTrilhaById(id)
        setTrilha(trilhaData)
        try {
          const aulasData = await getAulasByTrilha(id)
          setAulas(aulasData)
        } catch {
          // aulas falharam — mostra trilha sem aulas
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (!loadingCheck && matriculado) load()
  }, [id, loadingCheck, matriculado]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.empty}>
          <Icon name="hourglass" size={28} style={{ opacity: .4 }} />
          <p>Carregando trilha...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !trilha) {
    return (
      <DashboardLayout>
        <div className={styles.empty}>
          <Icon name="alertCircle" size={28} style={{ opacity: .5 }} />
          <p>{error ?? 'Trilha não encontrada.'}</p>
          <button className={styles.btnBack} onClick={() => navigate('/dashboard')}>Voltar</button>
        </div>
      </DashboardLayout>
    )
  }

  const total    = aulas.length
  const done     = aulas.filter(a => concluidasSet.has(Number(a.id))).length
  const pct      = total === 0 ? 0 : Math.round((done / total) * 100)
  const nivel    = NIVEL_COLOR[trilha.nivel] ?? NIVEL_COLOR['BASICO']
  const iconName = SUBJECT_ICON[trilha.disciplina] ?? 'bookOpen'

  const exercicios = aulas.map(aulaToExercicio).filter(Boolean)

  const aulaAberta = modal !== null ? aulas[modal.aulaIdx] : null
  const exAberto   = modal?.tipo === 'exercicio'
    ? exercicios.find(e => e.id === aulaAberta?.id)
    : null
  const exIdx = exAberto ? exercicios.indexOf(exAberto) : -1

  function abrirAula(idx) {
    const aula = aulas[idx]
    const tipo = aulaTipo(aula)
    setModal({ tipo: tipo === 'questionario' ? 'exercicio' : 'conteudo', aulaIdx: idx })
  }

  function handleConcluir(aulaId) {
    concluirAula(Number(id), Number(aulaId))
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>

        <button className={styles.btnBack} onClick={() => navigate('/dashboard')}>
          Voltar às trilhas
        </button>

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIconWrap}>
              <Icon name={iconName} size={22} />
            </span>
            <div className={styles.headerInfo}>
              <div className={styles.headerTop}>
                <h1 className={styles.title}>{trilha.nome}</h1>
                <span className={styles.nivelBadge} style={{ color: nivel.color, background: nivel.bg, borderColor: nivel.border }}>
                  {trilha.nivel}
                </span>
              </div>
              {trilha.professorNome && (
                <p className={styles.professor}>
                  <Icon name="user" size={13} style={{ opacity: .6 }} />
                  {trilha.professorNome}
                </p>
              )}
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
                  ? 'Parabéns! Você concluiu toda a trilha!'
                  : total === 0
                    ? 'Nenhuma aula disponível ainda.'
                    : `${done} de ${total} aula${total !== 1 ? 's' : ''} concluída${done !== 1 ? 's' : ''}`}
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
            <span className={styles.moduleTag}>Conteúdo</span>
            <h2 className={styles.moduleTitle}>Aulas da trilha</h2>
            <p className={styles.moduleSub}>{total} aula{total !== 1 ? 's' : ''}</p>
          </div>

          {total === 0 ? (
            <p style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>
              Esta trilha ainda não tem aulas.
            </p>
          ) : (
            <div className={styles.exList}>
              {aulas.map((aula, i) => {
                const tipo   = aulaTipo(aula)
                const isDone = concluidasSet.has(Number(aula.id))
                return (
                  <button
                    key={aula.id}
                    className={`${styles.exCard} ${isDone ? styles.exCardDone : ''} ${styles.exCardClickable}`}
                    onClick={() => abrirAula(i)}
                  >
                    <div className={styles.exLeft}>
                      <span className={`${styles.exNum} ${isDone ? styles.exNumDone : ''}`}>
                        {isDone ? <Icon name="check" size={13}/> : i + 1}
                      </span>
                      <div>
                        <p className={styles.exTitle}>
                          <Icon name={TIPO_ICON[tipo] ?? 'fileText'} size={13} style={{ opacity: .7 }} />
                          {aula.titulo}
                        </p>
                        <span className={isDone ? styles.doneTag : styles.pendingTag}>
                          {isDone ? 'Concluída' : tipo === 'questionario' ? 'Exercício' : 'Aula'}
                        </span>
                      </div>
                    </div>
                    <span className={styles.btnAbrir}>
                      {isDone ? 'Rever →' : 'Abrir →'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </section>

      </div>

      {modal?.tipo === 'conteudo' && aulaAberta && (
        <AulaConteudoModal
          key={aulaAberta.id}
          aula={aulaAberta}
          isDone={concluidasSet.has(Number(aulaAberta.id))}
          onConcluir={() => handleConcluir(aulaAberta.id)}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.tipo === 'exercicio' && exAberto && (
        <ExercicioModal
          key={exAberto.id}
          ex={exAberto}
          isDone={concluidasSet.has(Number(aulaAberta.id))}
          onConcluir={() => handleConcluir(aulaAberta.id)}
          onClose={() => setModal(null)}
          onProximo={() => {
            const next = exIdx + 1
            if (next < exercicios.length) {
              const nextAulaIdx = aulas.findIndex(a => a.id === exercicios[next].id)
              setModal({ tipo: 'exercicio', aulaIdx: nextAulaIdx })
            } else {
              setModal(null)
            }
          }}
          temProximo={exIdx + 1 < exercicios.length}
        />
      )}
    </DashboardLayout>
  )
}
