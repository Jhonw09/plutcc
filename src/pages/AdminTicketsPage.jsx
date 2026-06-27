import { useState, useEffect } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import Icon from '../components/ui/Icon'
import { getTrilhasAdmin, getDuvidasAdmin } from '../api/services/adminService'
import styles from './AdminTicketsPage.module.css'

const STATUS_LABEL = { PENDENTE: 'Aberto', RESPONDIDA: 'Respondido', RESOLVIDA: 'Resolvido' }

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminTicketsPage() {
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

  const filtered = statusFilter === 'Todos'
    ? duvidas
    : duvidas.filter(d => d.status === statusFilter)

  const counts = {
    Todos:     duvidas.length,
    PENDENTE:  duvidas.filter(d => d.status === 'PENDENTE').length,
    RESPONDIDA: duvidas.filter(d => d.status === 'RESPONDIDA').length,
    RESOLVIDA: duvidas.filter(d => d.status === 'RESOLVIDA').length,
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Suporte / Tickets</h1>
            <p className={styles.sub}>Dúvidas abertas pelos alunos nas trilhas</p>
          </div>
        </div>

        {error && <p className={styles.error}><Icon name="alertCircle" size={13} /> {error}</p>}

        <div className={styles.layout}>
          {/* ── Trilha list ── */}
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

          {/* ── Dúvidas ── */}
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
                            <svg
                              className={`${styles.chevron} ${expandedId === d.id ? styles.chevronOpen : ''}`}
                              width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2"
                            >
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
      </div>
    </AdminLayout>
  )
}
