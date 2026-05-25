import { useState } from 'react'
import Icon from '../ui/Icon'
import styles from './TrailDuvidas.module.css'

const MOCK_DUVIDAS = [
  {
    id: 1,
    aluno: 'Ana Souza',
    aulaTitle: 'Introdução à Álgebra',
    mensagem: 'Não entendi como resolver equações de segundo grau com delta negativo. Poderia explicar melhor?',
    status: 'pendente',
    createdAt: '2 horas atrás',
  },
  {
    id: 2,
    aluno: 'Carlos Lima',
    aulaTitle: 'Funções do 1º Grau',
    mensagem: 'A diferença entre função crescente e decrescente ficou confusa pra mim. O gráfico ajuda a identificar?',
    status: 'respondida',
    createdAt: '1 dia atrás',
    resposta: 'Sim! No gráfico, se a reta sobe da esquerda para a direita, a função é crescente. Se desce, é decrescente. O coeficiente angular "a" determina isso: a > 0 crescente, a < 0 decrescente.',
  },
  {
    id: 3,
    aluno: 'Mariana Costa',
    aulaTitle: 'Geometria Plana',
    mensagem: 'Como calcular a área de um trapézio? Não lembro a fórmula.',
    status: 'pendente',
    createdAt: '3 horas atrás',
  },
  {
    id: 4,
    aluno: 'Pedro Alves',
    aulaTitle: 'Introdução à Álgebra',
    mensagem: 'Qual a diferença entre incógnita e variável? São a mesma coisa?',
    status: 'respondida',
    createdAt: '2 dias atrás',
    resposta: 'Boa pergunta! Incógnita é um valor desconhecido que queremos descobrir em uma equação. Variável representa um valor que pode mudar. Na prática, em equações, usamos os dois termos de forma intercambiável.',
  },
]

export default function TrailDuvidas() {
  const [duvidas, setDuvidas]       = useState(MOCK_DUVIDAS)
  const [respondendoId, setRespondendoId] = useState(null)
  const [respostaText, setRespostaText]   = useState('')
  const [filtro, setFiltro]         = useState('todas')

  const pendentes   = duvidas.filter(d => d.status === 'pendente').length
  const respondidas = duvidas.filter(d => d.status === 'respondida').length

  const visiveis = filtro === 'todas'
    ? duvidas
    : duvidas.filter(d => d.status === filtro)

  function handleResponder(id) {
    if (!respostaText.trim()) return
    setDuvidas(prev => prev.map(d =>
      d.id === id ? { ...d, status: 'respondida', resposta: respostaText.trim() } : d
    ))
    setRespondendoId(null)
    setRespostaText('')
  }

  function handleResolver(id) {
    setDuvidas(prev => prev.map(d =>
      d.id === id ? { ...d, status: 'respondida' } : d
    ))
  }

  function iniciarResposta(id) {
    setRespondendoId(id)
    setRespostaText('')
  }

  return (
    <div className={styles.container}>

      {/* Toolbar integrada: métricas + filtros */}
      <div className={styles.toolbar} data-tour="duvidas-toolbar">
        <div className={styles.toolbarStats}>
          <span className={styles.statItem}>
            <span className={styles.statNum}>{pendentes}</span> pendente{pendentes !== 1 ? 's' : ''}
          </span>
          <span className={styles.statDot}>·</span>
          <span className={styles.statItem}>
            <span className={`${styles.statNum} ${styles.statNumGreen}`}>{respondidas}</span> respondida{respondidas !== 1 ? 's' : ''}
          </span>
          <span className={styles.statDot}>·</span>
          <span className={styles.statItem}>
            <span className={styles.statNum}>{duvidas.length}</span> total
          </span>
        </div>
        <div className={styles.toolbarFilters}>
          {['todas', 'pendente', 'respondida'].map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filtro === f ? styles.filterActive : ''}`}
              onClick={() => setFiltro(f)}
            >
              {{ todas: 'Todas', pendente: 'Pendentes', respondida: 'Respondidas' }[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {visiveis.length === 0 && (
        <div className={styles.empty}>
          <Icon name="inbox" size={32} style={{ opacity: .3 }} />
          <p>Nenhuma dúvida encontrada.</p>
        </div>
      )}

      <div className={styles.list}>
        {visiveis.map(d => (
          <div key={d.id} className={`${styles.card} ${d.status === 'respondida' ? styles.cardRespondida : ''}`}>

            {/* Cabeçalho do card */}
            <div className={styles.cardHeader}>
              <div className={styles.alunoInfo}>
                <div className={styles.avatar}>{d.aluno.charAt(0)}</div>
                <div>
                  <span className={styles.alunoNome}>{d.aluno}</span>
                  <span className={styles.aulaRef}>
                    <Icon name="bookOpen" size={11} />
                    {d.aulaTitle}
                  </span>
                </div>
              </div>
              <div className={styles.cardMeta}>
                <span className={styles.time}>
                  <Icon name="clock" size={11} /> {d.createdAt}
                </span>
                <span className={d.status === 'pendente' ? styles.badgePendente : styles.badgeRespondida}>
                  {d.status === 'pendente' ? 'Pendente' : 'Respondida'}
                </span>
              </div>
            </div>

            {/* Mensagem */}
            <p className={styles.mensagem}>{d.mensagem}</p>

            {/* Resposta existente */}
            {d.resposta && (
              <div className={styles.respostaBox}>
                <div className={styles.respostaLabel}>
                  <Icon name="checkCircle" size={13} /> Sua resposta
                </div>
                <p className={styles.respostaText}>{d.resposta}</p>
              </div>
            )}

            {/* Formulário de resposta inline */}
            {respondendoId === d.id && (
              <div className={styles.replyForm}>
                <textarea
                  className={styles.replyInput}
                  placeholder="Digite sua resposta..."
                  value={respostaText}
                  onChange={e => setRespostaText(e.target.value)}
                  rows={3}
                  autoFocus
                />
                <div className={styles.replyActions}>
                  <button className={styles.cancelBtn} onClick={() => setRespondendoId(null)}>
                    Cancelar
                  </button>
                  <button
                    className={styles.sendBtn}
                    onClick={() => handleResponder(d.id)}
                    disabled={!respostaText.trim()}
                  >
                    <Icon name="arrow" size={13} /> Enviar resposta
                  </button>
                </div>
              </div>
            )}

            {/* Ações */}
            {respondendoId !== d.id && (
              <div className={styles.cardActions}>
                {d.status === 'pendente' && (
                  <>
                    <button className={styles.btnResponder} onClick={() => iniciarResposta(d.id)}>
                      <Icon name="pencil" size={13} /> Responder
                    </button>
                    <button className={styles.btnResolver} onClick={() => handleResolver(d.id)}>
                      <Icon name="check" size={13} /> Marcar como resolvida
                    </button>
                  </>
                )}
                {d.status === 'respondida' && (
                  <button className={styles.btnResponder} onClick={() => iniciarResposta(d.id)}>
                    <Icon name="pencil" size={13} /> Editar resposta
                  </button>
                )}
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  )
}
