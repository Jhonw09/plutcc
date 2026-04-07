import { useCTA } from '../hooks/useCTA'
import styles from './Features.module.css'

const features = [
  {
    icon: '🎬',
    // Specific number (10 mil) + "do Brasil" grounds it; avoids "melhores professores" superlative
    title: 'Videoaulas que realmente explicam',
    desc: 'São mais de 10 mil aulas gravadas por professores experientes, organizadas por disciplina e assunto — sem enrolação.',
    color: 'var(--surface-3)',
  },
  {
    icon: '📝',
    // "Treine" is active voice; listing ENEM/FUVEST adds real credibility
    title: 'Exercícios pra treinar de verdade',
    desc: 'Mais de 500 mil questões comentadas, com provas do ENEM, FUVEST, UNICAMP e outros vestibulares. Dá pra filtrar por assunto e dificuldade.',
    color: 'var(--surface-3)',
  },
  {
    icon: '🤖',
    // Avoids "nossa inteligência artificial" corporate speak
    title: 'Um plano de estudos só seu',
    desc: 'A plataforma acompanha seu desempenho e sugere o que estudar a seguir. Nada de lista genérica — é baseado no que você já sabe.',
    color: 'var(--surface-3)',
  },
  {
    icon: '📊',
    // "Veja onde travar" is direct and honest
    title: 'Veja onde você tá travando',
    desc: 'Gráficos simples mostram sua evolução por disciplina. Dá pra saber exatamente o que revisar antes da prova.',
    color: 'var(--surface-3)',
  },
  {
    icon: '🏫',
    // "Seu professor manda" is concrete and relatable
    title: 'Conectado com a sua escola',
    desc: 'Seu professor pode mandar tarefas e conteúdos direto pela plataforma. Tudo num lugar só, sem ficar trocando de app.',
    color: 'var(--surface-3)',
  },
  {
    icon: '📱',
    // "Baixe e estude no ônibus" is a real scenario, not a feature list
    title: 'Estude até sem internet',
    desc: 'Funciona no celular, tablet e computador. Baixe as aulas e estude no ônibus, na fila, onde quiser.',
    color: 'var(--surface-3)',
  },
]

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
                <span>{f.icon}</span>
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
