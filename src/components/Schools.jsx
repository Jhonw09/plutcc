import styles from './Schools.module.css'

const features = [
  { icon: '🏫', title: 'Gestão de turmas', desc: 'Professores organizam turmas e acompanham o progresso coletivo.' },
  { icon: '📊', title: 'Relatórios institucionais', desc: 'Visão consolidada do desempenho de toda a escola em um só lugar.' },
  { icon: '🔗', title: 'Integração com sistemas', desc: 'Compatibilidade com plataformas e sistemas já utilizados pela instituição.' },
  { icon: '🎓', title: 'Trilhas personalizadas', desc: 'Conteúdo adaptado ao currículo e às necessidades de cada escola.' },
]

export default function Schools() {
  return (
    <section className={styles.section} id="schools">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.tag}>Visão de futuro</span>
          <h2 className={styles.title}>StudyConnect para Escolas</h2>
          <p className={styles.sub}>
            Esta é uma ideia que temos para o futuro do projeto. Caso o StudyConnect cresça,
            queremos oferecer uma solução completa para instituições de ensino — ainda não disponível.
          </p>
        </div>

        <div className={styles.logos}>
          {features.map((f, i) => (
            <div key={i} className={styles.logoCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <div>
                <span className={styles.logoName}>{f.title}</span>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <div className={styles.ctaBox}>
            <div className={styles.ctaContent}>
              <span className={styles.draftBadge}>Em desenvolvimento</span>
              <h3>Quer ver o StudyConnect na sua escola?</h3>
              <p>
                Por enquanto o StudyConnect está em fase de projeto acadêmico. Se você tem interesse
                em uma parceria futura, entre em contato — adoraríamos ouvir sua opinião.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <a href="/contato" className={styles.btnCta}>Entrar em contato</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
