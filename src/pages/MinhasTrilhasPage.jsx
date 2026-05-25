import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import { useMinhasTrilhas } from '../hooks/useMinhasTrilhas'
import Icon from '../components/ui/Icon'
import styles from './MinhasTrilhasPage.module.css'

const SUBJECT = {
  Matemática:  { icon: 'math',    color: '#818cf8', bg: 'rgba(99,102,241,.18)'  },
  Português:   { icon: 'book',    color: '#60a5fa', bg: 'rgba(59,130,246,.18)'  },
  Química:     { icon: 'flask',   color: '#34d399', bg: 'rgba(16,185,129,.18)'  },
  Biologia:    { icon: 'dna',     color: '#4ade80', bg: 'rgba(34,197,94,.18)'   },
  Física:      { icon: 'zap',     color: '#fbbf24', bg: 'rgba(245,158,11,.18)'  },
  Geografia:   { icon: 'globe',   color: '#38bdf8', bg: 'rgba(14,165,233,.18)'  },
  História:    { icon: 'scroll',  color: '#fb923c', bg: 'rgba(249,115,22,.18)'  },
  Inglês:      { icon: 'globe',   color: '#a78bfa', bg: 'rgba(139,92,246,.18)'  },
  Artes:       { icon: 'palette', color: '#f472b6', bg: 'rgba(236,72,153,.18)'  },
  Informática: { icon: 'monitor', color: '#22d3ee', bg: 'rgba(6,182,212,.18)'   },
  Filosofia:   { icon: 'brain',   color: '#c084fc', bg: 'rgba(168,85,247,.18)'  },
  Sociologia:  { icon: 'scale',   color: '#94a3b8', bg: 'rgba(100,116,139,.18)' },
}
const SUBJECT_DEFAULT = { icon: 'bookOpen', color: '#a78bfa', bg: 'rgba(139,92,246,.18)' }

const NIVEL_STYLE = {
  Básico:        { color: '#4ade80', bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.25)'  },
  Intermediário: { color: '#fbbf24', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.25)' },
  Avançado:      { color: '#f87171', bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.25)'  },
  BASICO:        { color: '#4ade80', bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.25)'  },
  INTERMEDIARIO: { color: '#fbbf24', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.25)' },
  AVANCADO:      { color: '#f87171', bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.25)'  },
}

const CATEGORIAS = ['Todas','Matemática','Português','Química','Biologia','Física','Geografia','História','Inglês','Informática','Filosofia']

function Skeleton() {
  return <div className={styles.skeleton} />
}

function TrilhaCard({ trilha, progresso, onAcao, labelAcao, ativa }) {
  const subj  = SUBJECT[trilha.disciplina] ?? SUBJECT_DEFAULT
  const nivel = NIVEL_STYLE[trilha.nivel]  ?? NIVEL_STYLE['BASICO']

  return (
    <div className={`${styles.card} ${ativa ? styles.cardAtiva : ''}`} onClick={onAcao}>
      <div className={styles.cardBand} style={{ background: subj.bg }}>
        <span className={styles.cardBandIcon} style={{ color: subj.color }}>
          <Icon name={subj.icon} size={28} />
        </span>
        {ativa && progresso != null && (
          <span className={styles.cardBandPct} style={{ color: subj.color }}>
            {progresso}%
          </span>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span className={styles.cardDisciplina} style={{ color: subj.color }}>
            {trilha.disciplina ?? 'Geral'}
          </span>
          {trilha.nivel && (
            <span className={styles.cardNivel}
              style={{ color: nivel.color, background: nivel.bg, borderColor: nivel.border }}>
              {trilha.nivel}
            </span>
          )}
        </div>

        <h3 className={styles.cardName}>{trilha.nome}</h3>

        {trilha.professorNome && (
          <p className={styles.cardProf}>
            <Icon name="user" size={11} />
            {trilha.professorNome}
          </p>
        )}

        {trilha.descricao && (
          <p className={styles.cardDesc}>{trilha.descricao}</p>
        )}

        {ativa && progresso != null && (
          <div className={styles.progressRow}>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${progresso}%`, background: subj.color }}
              />
            </div>
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        <button
          className={ativa ? styles.btnContinuar : styles.btnIniciar}
          style={ativa ? {} : { background: subj.color }}
          onClick={e => { e.stopPropagation(); onAcao() }}
        >
          {labelAcao}
          <Icon name="chevronRight" size={13} />
        </button>
      </div>
    </div>
  )
}

export default function MinhasTrilhasPage() {
  const navigate = useNavigate()
  const { minhasTrilhas, todasTrilhas, loading: loadingMinhas, getProgresso } = useMinhasTrilhas()

  const [filtro, setFiltro]       = useState('todas')
  const [search, setSearch]       = useState('')
  const [categoria, setCategoria] = useState('Todas')

  const isLoading = loadingMinhas
  const matriculadosIds = useMemo(() => new Set(minhasTrilhas.map(t => t.id)), [minhasTrilhas])
  const concluidas      = useMemo(() => minhasTrilhas.filter(t => getProgresso(t.id) === 100), [minhasTrilhas, getProgresso])
  const emAndamento     = useMemo(() => minhasTrilhas.filter(t => getProgresso(t.id) < 100),  [minhasTrilhas, getProgresso])

  const minhasFiltradas = useMemo(() => {
    if (filtro === 'andamento')  return emAndamento
    if (filtro === 'concluidas') return concluidas
    return minhasTrilhas
  }, [filtro, minhasTrilhas, emAndamento, concluidas])

  const explorar = useMemo(() => {
    let list = todasTrilhas.filter(t => !matriculadosIds.has(t.id))
    if (categoria !== 'Todas') list = list.filter(t => t.disciplina === categoria)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(t =>
        t.nome?.toLowerCase().includes(q) ||
        t.descricao?.toLowerCase().includes(q) ||
        t.professorNome?.toLowerCase().includes(q)
      )
    }
    return list
  }, [todasTrilhas, matriculadosIds, categoria, search])

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ── Minhas trilhas ── */}
        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Minhas trilhas</h2>
            <div className={styles.tabs}>
              {[
                { key: 'todas',      label: `Todas (${minhasTrilhas.length})` },
                { key: 'andamento',  label: `Em andamento (${emAndamento.length})` },
                { key: 'concluidas', label: `Concluídas (${concluidas.length})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`${styles.tab} ${filtro === tab.key ? styles.tabActive : ''}`}
                  onClick={() => setFiltro(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className={styles.grid}>
              {[0,1,2].map(i => <Skeleton key={i} />)}
            </div>
          ) : minhasFiltradas.length === 0 ? (
            <div className={styles.empty}>
              <Icon name="inbox" size={28} style={{ opacity: .3 }} />
              <p>{filtro === 'concluidas' ? 'Nenhuma trilha concluída ainda.' : 'Nenhuma trilha em andamento.'}</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {minhasFiltradas.map(t => (
                <TrilhaCard
                  key={t.id}
                  trilha={t}
                  progresso={getProgresso(t.id)}
                  onAcao={() => navigate(`/dashboard/trilha/${t.id}`)}
                  labelAcao="Continuar"
                  ativa
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Explorar ── */}
        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Explorar trilhas</h2>
          </div>

          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}><Icon name="search" size={14} /></span>
            <input
              className={styles.searchInput}
              placeholder="Buscar por nome, professor ou descrição…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')}>
                <Icon name="close" size={11} />
              </button>
            )}
          </div>

          <div className={styles.filters}>
            {CATEGORIAS.map(cat => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${categoria === cat ? styles.filterBtnActive : ''}`}
                onClick={() => setCategoria(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className={styles.grid}>
              {[0,1,2,3].map(i => <Skeleton key={i} />)}
            </div>
          ) : explorar.length === 0 ? (
            <div className={styles.empty}>
              <Icon name="compass" size={28} style={{ opacity: .3 }} />
              <p>Nenhuma trilha encontrada.</p>
              {(search || categoria !== 'Todas') && (
                <button className={styles.clearBtn} onClick={() => { setSearch(''); setCategoria('Todas') }}>
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className={styles.grid}>
              {explorar.map(t => (
                <TrilhaCard
                  key={t.id}
                  trilha={t}
                  progresso={null}
                  onAcao={() => navigate(`/dashboard/trilha-detalhe/${t.id}`)}
                  labelAcao="Ver trilha"
                  ativa={false}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </DashboardLayout>
  )
}
