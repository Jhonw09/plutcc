import { useState, useEffect } from 'react'
import Icon from '../ui/Icon'
import { getDuvidasByTrilha, responderDuvida, resolverDuvida } from '../../api/services/duvidaService'
import styles from './TrailDuvidas.module.css'

export default function TrailDuvidas({ trilhaId }) {
  const [duvidas, setDuvidas]             = useState([])
  const [loading, setLoading]             = useState(true)
  const [respondendoId, setRespondendoId] = useState(null)
  const [respostaText, setRespostaText]   = useState('')
  const [salvandoId, setSalvandoId]       = useState(null)
  const [filtro, setFiltro]               = useState('todas')

  useEffect(() => {
    if (!trilhaId) return
    getDuvidasByTrilha(trilhaId).then(data => {
      setDuvidas(data ?? [])
      setLoading(false)
    })
  }, [trilhaId])

  const pendentes   = duvidas.filter(d => d.status === 'PENDENTE').length
  const respondidas = duvidas.filter(d => d.status === 'RESPONDIDA').length

  const visiveis = filtro === 'todas'
    ? duvidas
    : duvidas.filter(d => d.status === (filtro === 'pendente' ? 'PENDENTE' : 'RESPONDIDA'))

  async function handleResponder(id) {
    if (!respostaText.trim()) return
    setSalvandoId(id)
    try {
      const updated = await responderDuvida(id, respostaText.trim())
      setDuvidas(prev => prev.map(d => d.id === id ? updated : d))
      setRespondendoId(null)
      setRespostaText('')
    } finally {
      setSalvandoId(null)
    }
  }

  async function handleResolver(id) {
    setSalvandoId(id)
    try {
      const updated = await resolverDuvida(id)
      setDuvidas(prev => prev.map(d => d.id === id ? updated : d))
    } finally {
      setSalvandoId(null)
    }
  }

  function iniciarResposta(id) {
    setRespondendoId(id)
    setRespostaText('')
  }

  if (loading) return <div className={styles.container}><p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Carregando dúvidas...</p></div>

  return (
    <div className={styles.container}>

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

      {visiveis.length === 0 && (
        <div className={styles.empty}>
          <Icon name="inbox" size={32} style={{ opacity: .3 }} />
          <p>Nenhuma dúvida encontrada.</p>
        </div>
      )}

      <div className={styles.list}>
        {visiveis.map(d => (
          <div key={d.id} className={`${styles.card} ${d.status === 'RESPONDIDA' ? styles.cardRespondida : ''}`}>

            <div className={styles.cardHeader}>
              <div className={styles.alunoInfo}>
                <div className={styles.avatar}>{(d.alunoNome ?? 'A').charAt(0)}</div>
                <div>
                  <span className={styles.alunoNome}>{d.alunoNome}</span>
                  <span className={styles.aulaRef}>
                    <Icon name="bookOpen" size={11} />
                    {d.aulaTitulo}
                  </span>
                </div>
              </div>
              <div className={styles.cardMeta}>
                <span className={styles.time}>
                  <Icon name="clock" size={11} /> {new Date(d.criadaEm).toLocaleDateString('pt-BR')}
                </span>
                <span className={d.status === 'PENDENTE' ? styles.badgePendente : styles.badgeRespondida}>
                  {d.status === 'PENDENTE' ? 'Pendente' : 'Respondida'}
                </span>
              </div>
            </div>

            <p className={styles.mensagem}>{d.mensagem}</p>

            {d.resposta && (
              <div className={styles.respostaBox}>
                <div className={styles.respostaLabel}>
                  <Icon name="checkCircle" size={13} /> Sua resposta
                </div>
                <p className={styles.respostaText}>{d.resposta}</p>
              </div>
            )}

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
                  <button className={styles.cancelBtn} onClick={() => setRespondendoId(null)} disabled={salvandoId === d.id}>
                    Cancelar
                  </button>
                  <button
                    className={styles.sendBtn}
                    onClick={() => handleResponder(d.id)}
                    disabled={!respostaText.trim() || salvandoId === d.id}
                  >
                    {salvandoId === d.id
                      ? <><Icon name="hourglass" size={13} /> Respondendo...</>
                      : <><Icon name="arrow" size={13} /> Enviar resposta</>}
                  </button>
                </div>
              </div>
            )}

            {respondendoId !== d.id && (
              <div className={styles.cardActions}>
                {d.status === 'PENDENTE' && (
                  <>
                    <button className={styles.btnResponder} onClick={() => iniciarResposta(d.id)} disabled={salvandoId === d.id}>
                      <Icon name="pencil" size={13} /> Responder
                    </button>
                    <button className={styles.btnResolver} onClick={() => handleResolver(d.id)} disabled={salvandoId === d.id}>
                      {salvandoId === d.id
                        ? <><Icon name="hourglass" size={13} /> Salvando...</>
                        : <><Icon name="check" size={13} /> Marcar como resolvida</>}
                    </button>
                  </>
                )}
                {d.status === 'RESPONDIDA' && (
                  <button className={styles.btnResponder} onClick={() => iniciarResposta(d.id)} disabled={salvandoId === d.id}>
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
