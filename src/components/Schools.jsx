import styles from './Schools.module.css'

const schools = [
  'Colégio Objetivo', 'Anglo', 'Poliedro', 'COC', 'SEB',
  'Pitágoras', 'Rede Salesiana', 'Marista', 'Dom Bosco', 'Positivo',
  'Etapa', 'Bernoulli',
]

export default function Schools() {
  return (
    <section className={styles.section} id="schools">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.tag}>Parceiros</span>
          <h2 className={styles.title}>Mais de 20 mil escolas confiam no Plurall</h2>
          <p className={styles.sub}>Grandes redes de ensino e escolas independentes de todo o Brasil.</p>
        </div>

        <div className={styles.logos}>
          {schools.map((s, i) => (
            <div key={i} className={styles.logoCard}>
              <span className={styles.logoInitial}>{s[0]}</span>
              <span className={styles.logoName}>{s}</span>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <div className={styles.ctaBox}>
            <div className={styles.ctaContent}>
              <h3>Sua escola ainda não usa o Plurall?</h3>
              <p>Leve a melhor plataforma de estudos para seus alunos. Fale com nossa equipe e saiba como implementar.</p>
            </div>
            <div className={styles.ctaActions}>
              <a href="#" className={styles.btnCta}>Quero para minha escola</a>
              <a href="#" className={styles.btnCtaOutline}>Saiba mais</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
