import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import Icon from '../components/ui/Icon'
import { getTrilhaById } from '../api/services/trilhaService'
import { useAulas } from '../hooks/useAulas'
import { getEstatisticasTrilha, getDuvidasByTrilha } from '../api/services/duvidaService'
import styles from './AdminTrilhaDetalhePage.module.css'

const SUBJECT_ICON = {
  Matemática: 'math', Português: 'book', Química: 'flask',
  Biologia: 'dna', Física: 'zap', Geografia: 'globe',
  História: 'scroll', Inglês: 'globe', Informática: 'monitor',
}

const BLOCK_LABEL = {
  explicacao: 'Explicação', video: 'Vídeo',
  questionario: 'Questionário', texto_livre: 'Texto livre',
}

const STATUS_LABEL = { PENDENTE: 'Pendente', RESPONDIDA: 'Respondida', RESOLVIDA: 'Resolvida' }

export default function AdminTrilhaDetalhePage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [trilha,  setTrilha]  = useState(null)
  const [stats,   setStats]   = useState(null)
  const [duvidas, setDuvidas] = useState([])
  const [activeTab, setActiveTab] = useState('aulas')
  const [expandedDuvida, setExpandedDuvida] = useState(null)

  const { aulas, loading: loadingAulas } = useAulas(id)

  useEffect(() => {
    getTrilhaById(id).then(setTrilha).catch(() => {})
    getEstatisticasTrilha(id).then(setStats).catch(() => {})
    getDuvidasByTrilha(id).then(d => setDuvidas(d ?? [])).catch(() => {})
  }, [id])

  const iconName = SUBJECT_ICON[trilha?.disciplina] || 'bookOpen'

  const metrics = stats ? [
    { icon: 'users',       label: 'Alunos matriculados', value: stats.totalAlunos },
    { icon: 'checkCircle', label: 'Conclusões',          value: stats.totalConclusoes },
    { icon: 'alertCircle', label: 'Dúvidas pendentes',   value: stats.duvidasPendentes },
    { icon: 'activity',    label: 'Taxa de conclusão',   value: `${stats.taxaConclusao}%` },
  ] : []

  return (
    <AdminLayout>
      <div className={styles.page}>

        <button className={styles.back} onClick={() => navigate('/admin/trilhas')}>
          <Icon name="chevronLeft" size={14} /> Voltar para trilhas
        </button>

        {trilha && (
          <header className={styles.header}>
            <span className={styles.iconWrap}>
              <Icon name={iconName} size={26} />
            </span>
            <div className={styles.headerInfo}>
              <div className={styles.headerTop}>
                <h1 className={styles.title}>{trilha.nome}</h1>
                <div className={styles.badges}>
                  {trilha.disciplina && <span className={styles.badge}>{trilha.disciplina}</span>}
                  {trilha.nivel      && <span className={styles.badge}>{trilha.nivel}</span>}
                  {trilha.tipo && (
                    <span className={`${styles.badge} ${trilha.tipo === 'PUBLICA' ? styles.badgePublic : styles.badgePrivate}`}>
                      {trilha.tipo === 'PUBLICA' ? 'Pública' : 'Privada'}
                    </span>
                  )}
                </div>
              </div>
              <p className={styles.prof}><Icon name="user" size={12} /> {trilha.professorNome ?? '—'}</p>
              {trilha.descricao && <p className={styles.desc}>{trilha.descricao}</p>}
            </div>
          </header>
        )}

        {/* Métricas rápidas */}
        {stats && (
          <div className={styles.metricsRow}>
            {metrics.map((m, i) => (
              <div key={i} className={styles.metricCard}>
                <span className={styles.metricIcon}><Icon name={m.icon} size={16} /></span>
                <span className={styles.metricValue}>{m.value}</span>
                <span className={styles.metricLabel}>{m.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Abas */}
        <nav className={styles.tabs}>
          {['aulas', 'duvidas', 'progresso'].map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {{ aulas: 'Aulas', duvidas: 'Dúvidas', progresso: 'Progresso por aula' }[tab]}
            </button>
          ))}
        </nav>

        {/* ── Aulas ── */}
        {activeTab === 'aulas' && (
          <div className={styles.section}>
            {loadingAulas ? (
              <p className={styles.muted}>Carregando aulas...</p>
            ) : aulas.length === 0 ? (
              <p className={styles.muted}>Nenhuma aula cadastrada.</p>
            ) : aulas.map((a, i) => (
              <div key={a.id} className={styles.aulaRow}>
                <span className={styles.aulaIdx}>{i + 1}</span>
                <div className={styles.aulaInfo}>
                  <span className={styles.aulaTitle}>{a.titulo}</span>
                  {(a.blocos ?? []).length > 0 && (
                    <div className={styles.aulaBlocos}>
                      {(a.blocos ?? []).map((b, j) => (
                        <span key={j} className={styles.blocoTag}>{BLOCK_LABEL[b.tipo] ?? b.tipo}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className={a.status === 'RASCUNHO' ? styles.statusDraft : styles.statusPublished}>
                  {a.status === 'RASCUNHO' ? 'Rascunho' : 'Publicada'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Dúvidas ── */}
        {activeTab === 'duvidas' && (
          <div className={styles.section}>
            {duvidas.length === 0 ? (
              <p className={styles.muted}>Nenhuma dúvida nesta trilha.</p>
            ) : duvidas.map(d => (
              <div key={d.id} className={styles.duvidaRow}>
                <button
                  className={styles.duvidaHeader}
                  onClick={() => setExpandedDuvida(expandedDuvida === d.id ? null : d.id)}
                >
                  <div className={styles.duvidaMeta}>
                    <span className={`${styles.statusDot} ${styles[d.status?.toLowerCase()]}`} />
                    <span className={styles.duvidaAluno}>{d.alunoNome}</span>
                    <span className={styles.duvidaAula}>{d.aulaTitulo}</span>
                    <span className={styles.duvidaDate}>
                      {new Date(d.criadaEm).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[d.status?.toLowerCase()]}`}>
                    {STATUS_LABEL[d.status] ?? d.status}
                  </span>
                </button>
                {expandedDuvida === d.id && (
                  <div className={styles.duvidaBody}>
                    <p className={styles.duvidaMsg}>{d.mensagem}</p>
                    {d.resposta && (
                      <div className={styles.duvidaResposta}>
                        <span className={styles.respostaLabel}>Resposta do professor</span>
                        <p className={styles.duvidaMsg}>{d.resposta}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Progresso por aula ── */}
        {activeTab === 'progresso' && (
          <div className={styles.section}>
            {!stats?.aulaProgresso?.length ? (
              <p className={styles.muted}>Sem dados de progresso.</p>
            ) : stats.aulaProgresso.map((row, i) => (
              <div key={i} className={styles.progressRow}>
                <span className={styles.progressLabel}>{row.titulo}</span>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${row.pct}%` }} />
                </div>
                <span className={styles.progressPct}>{row.pct}%</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  )
}
