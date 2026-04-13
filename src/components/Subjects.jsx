import { useCTA } from '../hooks/useCTA'
import { subjects } from '../data/subjects'
import Icon from './ui/Icon'
import styles from './Subjects.module.css'

export default function Subjects() {
  const handleCTA = useCTA()
  return (
    <section className={styles.section} id="conteudos">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="section-tag blue">Disciplinas</span>
          <h2 className="section-title">Todas as matérias? Tá tudo aqui.</h2>
          <p className="section-sub">Do Fundamental ao Médio, do básico ao avançado. Escolha uma disciplina e comece agora.</p>
        </div>

        <div className={styles.grid}>
          {subjects.map((s, i) => (
            <a key={i} href="/cadastro" className={styles.card} onClick={handleCTA}>
              <div className={styles.cardIcon}><Icon name={s.icon} size={22} /></div>
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
          <a href="/cadastro" className="btn-outline" onClick={handleCTA}>Ver todas as disciplinas</a>
        </div>
      </div>
    </section>
  )
}
