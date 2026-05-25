import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import SpotlightTour from '../components/ui/SpotlightTour'
import { getTrilhasPublicas } from '../api/services/trilhaService'
import Icon from '../components/ui/Icon'
import styles from './ExplorarTrilhas.module.css'

const TRILHAS_TOUR_STEPS = [
  {
    target: 'trilhas-hero',
    title: 'Busque o que quiser aprender',
    description: 'Use a barra de busca para encontrar trilhas por nome, professor ou descrição.',
  },
  {
    target: 'trilhas-filtros',
    title: 'Filtre por disciplina',
    description: 'Clique em uma categoria para ver só as trilhas daquela matéria.',
  },
  {
    target: 'trilhas-grid',
    title: 'Escolha uma trilha',
    description: 'Cada card mostra o nome, disciplina, nível e professor. Clique em "Ver trilha" para se matricular e começar.',
  },
]

const CATEGORIAS = ['Todas', 'Matemática', 'Português', 'Química', 'Biologia', 'Física', 'Geografia', 'História', 'Inglês', 'Informática', 'Filosofia']

const NIVEL_COLOR = {
  Fundamental:   { bg: 'rgba(34,197,94,0.12)',  color: '#22C55E' },
  Médio:         { bg: 'rgba(108,92,231,0.12)', color: '#6C5CE7' },
  Vestibular:    { bg: 'rgba(239,68,68,0.12)',  color: '#EF4444' },
  BASICO:        { bg: 'rgba(34,197,94,0.12)',  color: '#22C55E' },
  INTERMEDIARIO: { bg: 'rgba(108,92,231,0.12)', color: '#6C5CE7' },
  AVANCADO:      { bg: 'rgba(239,68,68,0.12)',  color: '#EF4444' },
}

export default function ExplorarTrilhas() {
  const navigate = useNavigate()
  const location = useLocation()
  const [trilhas,   setTrilhas]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [search,    setSearch]    = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [showTour,  setShowTour]  = useState(false)

  useEffect(() => {
    getTrilhasPublicas()
      .then(setTrilhas)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Ativa tour se vier da dashboard com state.startTour
  useEffect(() => {
    if (location.state?.startTour) {
      setTimeout(() => setShowTour(true), 400)
      // limpa o state para não reativar no F5
      window.history.replaceState({}, '')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const visivel = useMemo(() => {
    let list = trilhas
    if (categoria !== 'Todas') list = list.filter(t => t.disciplina === categoria)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(t =>
        t.nome?.toLowerCase().includes(q) ||
        t.descricao?.toLowerCase().includes(q) ||
        t.professor?.toLowerCase().includes(q) ||
        t.professorNome?.toLowerCase().includes(q)
      )
    }
    return list
  }, [trilhas, search, categoria])

  return (
    <DashboardLayout>
      <SpotlightTour
        steps={TRILHAS_TOUR_STEPS}
        active={showTour}
        onFinish={() => setShowTour(false)}
      />
      <div className={styles.page}>

        <div className={styles.hero} data-tour="trilhas-hero">
          <h1 className={styles.heroTitle}>Explorar Trilhas</h1>
          <p className={styles.heroSub}>Descubra trilhas de estudo criadas por professores e comece a aprender agora.</p>

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
        </div>

        <div className={styles.filters} data-tour="trilhas-filtros">
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

        {loading ? (
          <p className={styles.count}>Carregando trilhas...</p>
        ) : error ? (
          <div className={styles.empty}>
            <Icon name="warning" size={28} style={{ opacity: .4 }} />
            <p>{error}</p>
          </div>
        ) : (
          <>
            <p className={styles.count}>
              {visivel.length === 0
                ? 'Nenhuma trilha encontrada.'
                : `${visivel.length} trilha${visivel.length !== 1 ? 's' : ''} encontrada${visivel.length !== 1 ? 's' : ''}`}
            </p>

            {visivel.length > 0 ? (
              <div className={styles.grid} data-tour="trilhas-grid">
                {visivel.map(trilha => {
                  const nivel = NIVEL_COLOR[trilha.nivel] ?? NIVEL_COLOR['Médio']
                  return (
                    <div key={trilha.id} className={styles.card}>
                      <div className={styles.cardTop}>
                        <div className={styles.cardMeta}>
                          <span className={styles.disciplina}>{trilha.disciplina}</span>
                          <span className={styles.nivel} style={{ background: nivel.bg, color: nivel.color }}>
                            {trilha.nivel}
                          </span>
                        </div>
                        <h3 className={styles.cardTitle}>{trilha.nome}</h3>
                        <p className={styles.cardDesc}>{trilha.descricao}</p>
                      </div>

                      <div className={styles.cardFooter}>
                        <div className={styles.cardInfo}>
                          <span className={styles.cardInfoItem}>
                            <Icon name="user" size={13} style={{display:'inline',verticalAlign:'middle',marginRight:4}} />
                            {trilha.professor ?? trilha.professorNome ?? 'Professor'}
                          </span>
                        </div>
                        <button
                          className={styles.verBtn}
                          onClick={() => navigate(`/dashboard/trilha/${trilha.id}`)}
                        >
                          Ver trilha →
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className={styles.empty}>
                <Icon name="search" size={28} style={{ opacity: .4 }} />
                <p>Nenhuma trilha corresponde à sua busca.</p>
                <button className={styles.clearBtn} onClick={() => { setSearch(''); setCategoria('Todas') }}>
                  Limpar filtros
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </DashboardLayout>
  )
}
