import styles from './Subjects.module.css'

const subjects = [
  { icon:'📐', name:'Matemática',   count:'1.240 aulas' },
  { icon:'📖', name:'Português',    count:'980 aulas'   },
  { icon:'⚗️', name:'Química',      count:'760 aulas'   },
  { icon:'🧬', name:'Biologia',     count:'890 aulas'   },
  { icon:'⚡', name:'Física',       count:'820 aulas'   },
  { icon:'🌍', name:'Geografia',    count:'640 aulas'   },
  { icon:'📜', name:'História',     count:'710 aulas'   },
  { icon:'🌐', name:'Inglês',       count:'530 aulas'   },
  { icon:'🎨', name:'Artes',        count:'320 aulas'   },
  { icon:'💻', name:'Informática',  count:'410 aulas'   },
  { icon:'🧠', name:'Filosofia',    count:'360 aulas'   },
  { icon:'⚖️', name:'Sociologia',   count:'290 aulas'   },
]

export default function Subjects() {
  return (
    <section className={styles.section} id="conteudos">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="section-tag blue">Disciplinas</span>
          {/* "tá tudo aqui" is casual and direct — avoids the formal "em um só lugar" */}
          <h2 className="section-title">Todas as matérias? Tá tudo aqui.</h2>
          <p className="section-sub">Do Fundamental ao Médio, do básico ao avançado. Escolha uma disciplina e comece agora.</p>
        </div>

        <div className={styles.grid}>
          {subjects.map((s, i) => (
            <a key={i} href="#" className={styles.card}>
              <div className={styles.cardIcon}>{s.icon}</div>
              <div className={styles.cardInfo}>
                <span className={styles.cardName}>{s.name}</span>
                <span className={styles.cardCount}>{s.count}</span>
              </div>
              <svg className={styles.arrow} width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ))}
        </div>

        <div className={styles.footer}>
          <a href="#" className="btn-outline">Ver todas as disciplinas</a>
        </div>
      </div>
    </section>
  )
}
