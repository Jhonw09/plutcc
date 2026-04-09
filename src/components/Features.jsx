import { useCTA } from '../hooks/useCTA'
import { features } from '../data/features'
import Icon from './ui/Icon'
import styles from './Features.module.css'

export default function Features() {
  const handleCTA = useCTA()
  return (
    <section className={styles.section} id="alunos">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="section-tag blue">Recursos</span>
          {/* Shorter, less formal — "o que você precisa" is warmer than "tudo que" */}
          <h2 className="section-title">O que você precisa<br />pra estudar melhor</h2>
          <p className="section-sub">Uma plataforma que junta videoaulas, exercícios e organização — pra você focar no que importa.</p>
        </div>

        <div className={styles.grid}>
          {features.map((f, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.iconWrap} style={{ background: f.color }}>
                <Icon name={f.icon} size={26} />
              </div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.desc}</p>
              <a href="/cadastro" className={styles.cardLink} onClick={handleCTA}>
                Saiba mais
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
