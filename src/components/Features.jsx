import styles from './Features.module.css'

const features = [
  {
    icon: '🎬',
    title: 'Videoaulas com os melhores professores',
    desc: 'Mais de 10.000 videoaulas gravadas pelos melhores professores do Brasil, organizadas por disciplina, série e assunto.',
    color: 'var(--surface-3)',
  },
  {
    icon: '📝',
    title: 'Exercícios e banco de questões',
    desc: 'Mais de 500 mil questões comentadas, incluindo provas do ENEM, FUVEST, UNICAMP e principais vestibulares.',
    color: 'var(--surface-3)',
  },
  {
    icon: '🤖',
    title: 'Trilhas personalizadas com IA',
    desc: 'Nossa inteligência artificial analisa seu desempenho e cria um plano de estudos personalizado para você evoluir mais rápido.',
    color: 'var(--surface-3)',
  },
  {
    icon: '📊',
    title: 'Relatórios de desempenho',
    desc: 'Acompanhe sua evolução em tempo real com gráficos detalhados. Saiba exatamente onde você precisa melhorar.',
    color: 'var(--surface-3)',
  },
  {
    icon: '🏫',
    title: 'Integrado com sua escola',
    desc: 'Receba tarefas, provas e conteúdos enviados pelo seu professor diretamente na plataforma.',
    color: 'var(--surface-3)',
  },
  {
    icon: '📱',
    title: 'Estude em qualquer lugar',
    desc: 'Acesse pelo celular, tablet ou computador. Baixe conteúdos e estude mesmo sem internet.',
    color: 'var(--surface-3)',
  },
]

export default function Features() {
  return (
    <section className={styles.section} id="alunos">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="section-tag blue">Recursos</span>
          <h2 className="section-title">Tudo que você precisa<br />para estudar melhor</h2>
          <p className="section-sub">Uma plataforma completa que une tecnologia e educação para transformar o aprendizado de milhões de alunos.</p>
        </div>

        <div className={styles.grid}>
          {features.map((f, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.iconWrap} style={{ background: f.color }}>
                <span>{f.icon}</span>
              </div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.desc}</p>
              <a href="#" className={styles.cardLink}>
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
