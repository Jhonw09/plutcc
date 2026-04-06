import styles from './HowItWorks.module.css'

const steps = [
  {
    num: '01',
    title: 'Crie sua conta',
    desc: 'Cadastre-se gratuitamente com e-mail ou pelo código da sua escola em menos de 1 minuto.',
    icon: '👤',
  },
  {
    num: '02',
    title: 'Escolha o que estudar',
    desc: 'Navegue pelas disciplinas, acesse videoaulas, exercícios e materiais do seu professor.',
    icon: '📚',
  },
  {
    num: '03',
    title: 'Pratique e evolua',
    desc: 'Resolva questões, faça simulados e acompanhe seu desempenho em tempo real.',
    icon: '🚀',
  },
  {
    num: '04',
    title: 'Alcance seus objetivos',
    desc: 'Passe no ENEM, vestibulares e conquiste a vaga que você sempre sonhou.',
    icon: '🏆',
  },
]

export default function HowItWorks() {
  return (
    <section className={styles.section} id="how">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.tag}>Como funciona</span>
          <h2 className={styles.title}>Simples, rápido e eficiente</h2>
          <p className={styles.sub}>Em poucos passos você já está estudando com a melhor plataforma do Brasil.</p>
        </div>

        <div className={styles.steps}>
          {steps.map((s, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepNum}>{s.num}</div>
              <div className={styles.stepIcon}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < steps.length - 1 && <div className={styles.arrow}>→</div>}
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <a href="#" className={styles.btnCta}>Começar agora — é grátis</a>
        </div>
      </div>
    </section>
  )
}
