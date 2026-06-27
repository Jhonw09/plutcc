import { useState, useEffect } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import Icon from '../components/ui/Icon'
import { getTrilhasAdmin, getDuvidasAdmin } from '../api/services/adminService'
import { getTickets, responderTicket, fecharTicket } from '../api/services/ticketService'
import styles from './AdminTicketsPage.module.css'

const STATUS_LABEL = { PENDENTE: 'Aberto', RESPONDIDA: 'Respondido', RESOLVIDA: 'Resolvido' }
const TICKET_STATUS_LABEL = { ABERTO: 'Aberto', RESPONDIDO: 'Respondido', FECHADO: 'Fechado' }

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Aba dúvidas de trilhas ─────────────────────────────────────────────────
function DuvidasTab() {
  const [trilhas,      setTrilhas]      = useState([])
  const [trilhaSel,    setTrilhaSel]    = useState(null)
  const [duvidas,      setDuvidas]      = useState([])
  const [loadTrilhas,  setLoadTrilhas]  = useState(true)
  const [loadDuvidas,  setLoadDuvidas]  = useState(false)
  const [expandedId,   setExpandedId]   = useState(null)
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [error,        setError]        = useState('')

  useEffect(() => {
    getTrilhasAdmin()
      .then(setTrilhas)
      .catch(e => setError(e.message))
      .finally(() => setLoadTrilhas(false))
  }, [])

  async function selectTrilha(trilha) {
    setTrilhaSel(trilha)
    setDuvidas([])
    setExpandedId(null)
    setStatusFilter('Todos')
    setLoadDuvidas(true)
    try {
      const data = await getDuvidasAdmin(trilha.id)
      setDuvidas(data)
    } catch {
      setError('Erro ao carregar dúvidas.')
    } finally {
      setLoadDuvidas(false)
    }
  }

  const filtered = statusFilter === 'Todos' ? duvidas : duvidas.filter(d => d.status === statusFilter)
  const counts = {
    Todos:      duvidas.length,
    PENDENTE:   duvidas.filter(d => d.status === 'PENDENTE').length,
    RESPONDIDA: duvidas.filter(d => d.status === 'RESPONDIDA').length,
    RESOLVIDA:  duvidas.filter(d => d.status === 'RESOLVIDA').length,
  }

  return (
    <>
      {error && <p className={styles.error}><Icon name="alertCircle" size={13} /> {error}</p>}
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <p className={styles.sidebarLabel}>Selecionar trilha</p>
          {loadTrilhas ? (
            <div className={styles.sidebarLoading}>Carregando...</div>
          ) : trilhas.map(t => (
            <button
              key={t.id}
              className={`${styles.trilhaItem} ${trilhaSel?.id === t.id ? styles.trilhaItemActive : ''}`}
              onClick={() => selectTrilha(t)}
            >
              <span className={styles.trilhaNome}>{t.nome}</span>
              <span className={styles.trilhaProf}>{t.professorNome ?? '—'}</span>
            </button>
          ))}
        </aside>

        <div className={styles.content}>
          {!trilhaSel ? (
            <div className={styles.emptyState}>
              <Icon name="alertCircle" size={32} />
              <p>Selecione uma trilha para ver os tickets</p>
            </div>
          ) : (
            <>
              <div className={styles.contentHeader}>
                <span className={styles.contentTitle}>{trilhaSel.nome}</span>
                <div className={styles.statusFilters}>
                  {['Todos', 'PENDENTE', 'RESPONDIDA', 'RESOLVIDA'].map(s => (
                    <button
                      key={s}
                      className={`${styles.statusBtn} ${statusFilter === s ? styles.statusBtnActive : ''}`}
                      onClick={() => setStatusFilter(s)}
                    >
                      {s === 'Todos' ? 'Todos' : STATUS_LABEL[s]}
                      <span className={styles.count}>{counts[s]}</span>
                    </button>
                  ))}
                </div>
              </div>
              {loadDuvidas ? (
                <div className={styles.loading}>Carregando dúvidas...</div>
              ) : filtered.length === 0 ? (
                <div className={styles.empty}>Nenhum ticket encontrado.</div>
              ) : (
                <div className={styles.ticketList}>
                  {filtered.map(d => (
                    <div key={d.id} className={styles.ticket}>
                      <button
                        className={styles.ticketHeader}
                        onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                      >
                        <div className={styles.ticketMeta}>
                          <span className={`${styles.statusDot} ${styles[d.status?.toLowerCase()]}`} />
                          <span className={styles.ticketAluno}>{d.alunoNome ?? `Aluno #${d.alunoId}`}</span>
                          <span className={styles.ticketDate}>{formatDate(d.criadaEm)}</span>
                        </div>
                        <div className={styles.ticketRight}>
                          <span className={`${styles.statusBadge} ${styles[d.status?.toLowerCase()]}`}>
                            {STATUS_LABEL[d.status] ?? d.status}
                          </span>
                          <svg className={`${styles.chevron} ${expandedId === d.id ? styles.chevronOpen : ''}`}
                            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m6 9 6 6 6-6"/>
                          </svg>
                        </div>
                      </button>
                      {expandedId === d.id && (
                        <div className={styles.ticketBody}>
                          <div className={styles.ticketSection}>
                            <span className={styles.ticketSectionLabel}>Mensagem do aluno</span>
                            <p className={styles.ticketText}>{d.mensagem}</p>
                          </div>
                          {d.resposta && (
                            <div className={`${styles.ticketSection} ${styles.respostaSection}`}>
                              <span className={styles.ticketSectionLabel}>Resposta do professor</span>
                              <p className={styles.ticketText}>{d.resposta}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ── Aba tickets de suporte ─────────────────────────────────────────────────
function SuporteTab() {
  const [tickets,      setTickets]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [expandedId,   setExpandedId]   = useState(null)
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [resposta,     setResposta]     = useState({})
  const [submitting,   setSubmitting]   = useState(null)

  useEffect(() => {
    getTickets()
      .then(setTickets)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleResponder(id) {
    const texto = resposta[id]?.trim()
    if (!texto) return
    setSubmitting(id)
    try {
      const updated = await responderTicket(id, texto)
      setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updated, status: 'RESPONDIDO' } : t))
      setResposta(r => ({ ...r, [id]: '' }))
      setExpandedId(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(null)
    }
  }

  async function handleFechar(id) {
    setSubmitting(`close_${id}`)
    try {
      await fecharTicket(id)
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'FECHADO' } : t))
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(null)
    }
  }

  const filtered = statusFilter === 'Todos' ? tickets : tickets.filter(t => t.status === statusFilter)
  const counts = {
    Todos:      tickets.length,
    ABERTO:     tickets.filter(t => t.status === 'ABERTO').length,
    RESPONDIDO: tickets.filter(t => t.status === 'RESPONDIDO').length,
    FECHADO:    tickets.filter(t => t.status === 'FECHADO').length,
  }

  return (
    <>
      {error && <p className={styles.error}><Icon name="alertCircle" size={13} /> {error}</p>}
      <div className={styles.content} style={{ borderRadius: 16 }}>
        <div className={styles.contentHeader}>
          <span className={styles.contentTitle}>Todos os tickets de suporte</span>
          <div className={styles.statusFilters}>
            {['Todos', 'ABERTO', 'RESPONDIDO', 'FECHADO'].map(s => (
              <button
                key={s}
                className={`${styles.statusBtn} ${statusFilter === s ? styles.statusBtnActive : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'Todos' ? 'Todos' : TICKET_STATUS_LABEL[s]}
                <span className={styles.count}>{counts[s]}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Carregando tickets...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>Nenhum ticket encontrado.</div>
        ) : (
          <div className={styles.ticketList}>
            {filtered.map(t => (
              <div key={t.id} className={styles.ticket}>
                <button
                  className={styles.ticketHeader}
                  onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                >
                  <div className={styles.ticketMeta}>
                    <span className={`${styles.statusDot} ${styles[t.status?.toLowerCase()]}`} />
                    <div>
                      <span className={styles.ticketAluno}>{t.nome ?? t.email}</span>
                      <span className={styles.ticketTipo}>{t.tipo}</span>
                    </div>
                    <span className={styles.ticketDate}>{formatDate(t.criadaEm ?? t.createdAt)}</span>
                  </div>
                  <div className={styles.ticketRight}>
                    <span className={`${styles.statusBadge} ${styles[t.status?.toLowerCase()]}`}>
                      {TICKET_STATUS_LABEL[t.status] ?? t.status}
                    </span>
                    <svg className={`${styles.chevron} ${expandedId === t.id ? styles.chevronOpen : ''}`}
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </button>

                {expandedId === t.id && (
                  <div className={styles.ticketBody}>
                    <div className={styles.ticketSection}>
                      <span className={styles.ticketSectionLabel}>E-mail</span>
                      <p className={styles.ticketText}>{t.email}</p>
                    </div>
                    <div className={styles.ticketSection}>
                      <span className={styles.ticketSectionLabel}>Mensagem</span>
                      <p className={styles.ticketText}>{t.mensagem}</p>
                    </div>
                    {t.resposta && (
                      <div className={`${styles.ticketSection} ${styles.respostaSection}`}>
                        <span className={styles.ticketSectionLabel}>Resposta enviada</span>
                        <p className={styles.ticketText}>{t.resposta}</p>
                      </div>
                    )}
                    {t.status !== 'FECHADO' && (
                      <div className={styles.ticketSection}>
                        <span className={styles.ticketSectionLabel}>Responder</span>
                        <textarea
                          className={styles.replyTextarea}
                          placeholder="Escreva uma resposta..."
                          value={resposta[t.id] ?? ''}
                          onChange={e => setResposta(r => ({ ...r, [t.id]: e.target.value }))}
                        />
                        <div className={styles.replyActions}>
                          <button
                            className={styles.replyBtn}
                            disabled={!resposta[t.id]?.trim() || submitting === t.id}
                            onClick={() => handleResponder(t.id)}
                          >
                            {submitting === t.id ? 'Enviando...' : 'Responder'}
                          </button>
                          <button
                            className={styles.closeBtn}
                            disabled={submitting === `close_${t.id}`}
                            onClick={() => handleFechar(t.id)}
                          >
                            {submitting === `close_${t.id}` ? '...' : 'Fechar ticket'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function AdminTicketsPage() {
  const [aba, setAba] = useState('suporte')

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Suporte / Tickets</h1>
            <p className={styles.sub}>Gerencie tickets de suporte e dúvidas das trilhas</p>
          </div>
        </div>

        <div className={styles.abas}>
          <button
            className={`${styles.aba} ${aba === 'suporte' ? styles.abaActive : ''}`}
            onClick={() => setAba('suporte')}
          >
            <Icon name="mail" size={14} /> Suporte geral
          </button>
          <button
            className={`${styles.aba} ${aba === 'duvidas' ? styles.abaActive : ''}`}
            onClick={() => setAba('duvidas')}
          >
            <Icon name="alertCircle" size={14} /> Dúvidas das trilhas
          </button>
        </div>

        {aba === 'suporte' ? <SuporteTab /> : <DuvidasTab />}
      </div>
    </AdminLayout>
  )
}
