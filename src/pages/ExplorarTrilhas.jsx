import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import styles from './ExplorarTrilhas.module.css'

const MOCK_TRILHAS = [
  { id: 1,  nome: 'Álgebra Linear',          disciplina: 'Matemática', nivel: 'Médio',       descricao: 'Vetores, matrizes e transformações lineares do zero ao avançado.',         professor: 'Prof. Carlos Mendes',  aulas: 12 },
  { id: 2,  nome: 'Redação para o ENEM',      disciplina: 'Português',  nivel: 'Vestibular',  descricao: 'Estrutura da dissertação, repertório e como tirar nota 1000.',             professor: 'Profa. Ana Lima',      aulas: 8  },
  { id: 3,  nome: 'Química Orgânica',         disciplina: 'Química',    nivel: 'Médio',       descricao: 'Funções orgânicas, reações e nomenclatura de forma didática.',             professor: 'Prof. Roberto Faria',  aulas: 15 },
  { id: 4,  nome: 'Genética e Hereditariedade', disciplina: 'Biologia', nivel: 'Médio',       descricao: 'Leis de Mendel, DNA, RNA e biotecnologia explicados com clareza.',        professor: 'Profa. Juliana Costa', aulas: 10 },
  { id: 5,  nome: 'Mecânica Clássica',        disciplina: 'Física',     nivel: 'Vestibular',  descricao: 'Cinemática, dinâmica e energia para vestibulares e olimpíadas.',           professor: 'Prof. Marcos Souza',   aulas: 18 },
  { id: 6,  nome: 'Geopolítica Mundial',      disciplina: 'Geografia',  nivel: 'Vestibular',  descricao: 'Conflitos, blocos econômicos e questões ambientais globais.',              professor: 'Profa. Fernanda Reis', aulas: 9  },
  { id: 7,  nome: 'Brasil República',         disciplina: 'História',   nivel: 'Médio',       descricao: 'Da Proclamação da República até os dias atuais com análise crítica.',      professor: 'Prof. Diego Alves',    aulas: 11 },
  { id: 8,  nome: 'English for Beginners',    disciplina: 'Inglês',     nivel: 'Fundamental', descricao: 'Vocabulário, gramática básica e conversação para iniciantes.',             professor: 'Profa. Sarah Oliveira', aulas: 14 },
  { id: 9,  nome: 'Lógica de Programação',    disciplina: 'Informática', nivel: 'Fundamental', descricao: 'Algoritmos, variáveis e estruturas de controle para quem está começando.', professor: 'Prof. Lucas Neves',    aulas: 16 },
  { id: 10, nome: 'Filosofia Moderna',        disciplina: 'Filosofia',  nivel: 'Médio',       descricao: 'Descartes, Kant, Nietzsche e os grandes pensadores da modernidade.',       professor: 'Profa. Camila Torres', aulas: 7  },
]

const CATEGORIAS = ['Todas', 'Matemática', 'Português', 'Química', 'Biologia', 'Física', 'Geografia', 'História', 'Inglês', 'Informática', 'Filosofia']

const NIVEL_COLOR = {
  Fundamental: { bg: 'rgba(34,197,94,0.12)',  color: '#22C55E' },
  Médio:       { bg: 'rgba(108,92,231,0.12)', color: '#6C5CE7' },
  Vestibular:  { bg: 'rgba(239,68,68,0.12)',  color: '#EF4444' },
}

export default function ExplorarTrilhas() {
  const navigate = useNavigate()
  const [search, setSearch]   = useState('')
  const [categoria, setCategoria] = useState('Todas')

  const visivel = useMemo(() => {
    let list = MOCK_TRILHAS
    if (categoria !== 'Todas') list = list.filter(t => t.disciplina === categoria)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(t =>
        t.nome.toLowerCase().includes(q) ||
        t.descricao.toLowerCase().includes(q) ||
        t.professor.toLowerCase().includes(q)
      )
    }
    return list
  }, [search, categoria])

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ── Hero ── */}
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Explorar Trilhas</h1>
          <p className={styles.heroSub}>Descubra trilhas de estudo criadas por professores e comece a aprender agora.</p>

          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              placeholder="Buscar por nome, professor ou descrição…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>

        {/* ── Filtros ── */}
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

        {/* ── Contagem ── */}
        <p className={styles.count}>
          {visivel.length === 0
            ? 'Nenhuma trilha encontrada.'
            : `${visivel.length} trilha${visivel.length !== 1 ? 's' : ''} encontrada${visivel.length !== 1 ? 's' : ''}`}
        </p>

        {/* ── Grid de cards ── */}
        {visivel.length > 0 ? (
          <div className={styles.grid}>
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
                      <span className={styles.cardInfoItem}>👨‍🏫 {trilha.professor}</span>
                      <span className={styles.cardInfoItem}>📚 {trilha.aulas} aulas</span>
                    </div>
                    <button
                      className={styles.verBtn}
                      onClick={() => navigate(`/trilha/${trilha.id}`, { state: trilha })}
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
            <span className={styles.emptyIcon}>🔎</span>
            <p>Nenhuma trilha corresponde à sua busca.</p>
            <button className={styles.clearBtn} onClick={() => { setSearch(''); setCategoria('Todas') }}>
              Limpar filtros
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}
