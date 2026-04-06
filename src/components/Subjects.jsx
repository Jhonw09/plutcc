import { useState } from 'react'
import styles from './Subjects.module.css'

const subjects = [
  { icon:'📐', name:'Matemática',   count:'1.240 aulas', color:'rgba(255,255,255,0.04)', text:'var(--text-secondary)' },
  { icon:'📖', name:'Português',    count:'980 aulas',   color:'rgba(255,255,255,0.04)', text:'var(--text-secondary)' },
  { icon:'⚗️', name:'Química',      count:'760 aulas',   color:'rgba(255,255,255,0.04)', text:'var(--text-secondary)' },
  { icon:'🧬', name:'Biologia',     count:'890 aulas',   color:'rgba(255,255,255,0.04)', text:'var(--text-secondary)' },
  { icon:'⚡', name:'Física',       count:'820 aulas',   color:'rgba(255,255,255,0.04)', text:'var(--text-secondary)' },
  { icon:'🌍', name:'Geografia',    count:'640 aulas',   color:'rgba(255,255,255,0.04)', text:'var(--text-secondary)' },
  { icon:'📜', name:'História',     count:'710 aulas',   color:'rgba(255,255,255,0.04)', text:'var(--text-secondary)' },
  { icon:'🌐', name:'Inglês',       count:'530 aulas',   color:'rgba(255,255,255,0.04)', text:'var(--text-secondary)' },
  { icon:'🎨', name:'Artes',        count:'320 aulas',   color:'rgba(255,255,255,0.04)', text:'var(--text-secondary)' },
  { icon:'💻', name:'Informática',  count:'410 aulas',   color:'rgba(255,255,255,0.04)', text:'var(--text-secondary)' },
  { icon:'🧠', name:'Filosofia',    count:'360 aulas',   color:'rgba(255,255,255,0.04)', text:'var(--text-secondary)' },
  { icon:'⚖️', name:'Sociologia',   count:'290 aulas',   color:'rgba(255,255,255,0.04)', text:'var(--text-secondary)' },
]

export default function Subjects() {
  const [hovered, setHovered] = useState(null)

  return (
    <section className={styles.section} id="conteudos">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="section-tag blue">Disciplinas</span>
          <h2 className="section-title">Todas as matérias em um só lugar</h2>
          <p className="section-sub">Do Ensino Fundamental ao Ensino Médio, cobrimos tudo que você precisa para se preparar.</p>
        </div>

        <div className={styles.grid}>
          {subjects.map((s, i) => (
            <a
              key={i}
              href="#"
              className={styles.card}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={hovered === i ? { background: s.color, borderColor: s.text + '40' } : {}}
            >
              <div className={styles.cardIcon} style={{ background: hovered === i ? 'white' : s.color }}>
                {s.icon}
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardName} style={hovered === i ? { color: s.text } : {}}>{s.name}</span>
                <span className={styles.cardCount}>{s.count}</span>
              </div>
              <svg className={styles.arrow} width="16" height="16" viewBox="0 0 16 16" fill="none"
                style={hovered === i ? { color: s.text } : {}}>
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
