import { useState } from 'react'
import styles from './VideoSection.module.css'

const tabs = ['Videoaulas', 'Exercícios', 'Simulados', 'Relatórios']

const tabContent = {
  Videoaulas: {
    title: 'Videoaulas com os melhores professores do Brasil',
    desc: 'Assista quando quiser, quantas vezes precisar. Nossas videoaulas são gravadas por professores especialistas e organizadas por série, disciplina e assunto.',
    items: ['Mais de 10.000 videoaulas disponíveis', 'Legendas e transcrições automáticas', 'Velocidade ajustável (0.5x a 2x)', 'Anotações sincronizadas com o vídeo'],
    color: '#dbeafe',
    icon: '🎬',
  },
  Exercícios: {
    title: 'Banco com mais de 500 mil questões comentadas',
    desc: 'Pratique com questões de todos os níveis, incluindo provas do ENEM e principais vestibulares do Brasil. Cada questão tem resolução detalhada.',
    items: ['Questões do ENEM, FUVEST, UNICAMP e mais', 'Resolução comentada em vídeo e texto', 'Filtros por assunto, dificuldade e ano', 'Histórico completo de respostas'],
    color: '#fef3c7',
    icon: '📝',
  },
  Simulados: {
    title: 'Simulados completos no estilo ENEM',
    desc: 'Prepare-se para o dia da prova com simulados cronometrados que reproduzem fielmente o formato do ENEM e dos principais vestibulares.',
    items: ['Simulados cronometrados', 'Gabarito e ranking em tempo real', 'Análise de desempenho por área', 'Simulados personalizados por IA'],
    color: '#d1fae5',
    icon: '📋',
  },
  Relatórios: {
    title: 'Acompanhe sua evolução em tempo real',
    desc: 'Visualize seu progresso com gráficos detalhados. Identifique seus pontos fortes e as áreas que precisam de mais atenção.',
    items: ['Gráficos de evolução por disciplina', 'Comparativo com outros alunos', 'Metas semanais e mensais', 'Relatório para pais e professores'],
    color: '#ede9fe',
    icon: '📊',
  },
}

export default function VideoSection() {
  const [active, setActive] = useState('Videoaulas')
  const c = tabContent[active]

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="section-tag orange">Como funciona</span>
          <h2 className="section-title">Uma plataforma completa<br />para cada etapa do estudo</h2>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {tabs.map(t => (
            <button
              key={t}
              className={`${styles.tab} ${active === t ? styles.tabActive : ''}`}
              onClick={() => setActive(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.contentLeft}>
            <div className={styles.contentIcon} style={{ background: c.color }}>{c.icon}</div>
            <h3 className={styles.contentTitle}>{c.title}</h3>
            <p className={styles.contentDesc}>{c.desc}</p>
            <ul className={styles.contentList}>
              {c.items.map((item, i) => (
                <li key={i}>
                  <span className={styles.check}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <a href="#" className="btn-primary" style={{ marginTop: 8 }}>Experimentar grátis</a>
          </div>

          <div className={styles.contentRight}>
            <div className={styles.mockup} style={{ borderColor: c.color }}>
              <div className={styles.mockupBar}>
                <div className={styles.mockupDots}>
                  <span style={{background:'#ff5f57'}} />
                  <span style={{background:'#febc2e'}} />
                  <span style={{background:'#28c840'}} />
                </div>
                <div className={styles.mockupUrl}>plurall.net/{active.toLowerCase()}</div>
              </div>
              <div className={styles.mockupBody} style={{ background: c.color + '40' }}>
                <div className={styles.mockupCenter}>
                  <span className={styles.mockupBigIcon}>{c.icon}</span>
                  <div className={styles.mockupLines}>
                    <div className={styles.mockupLine} style={{width:'80%'}} />
                    <div className={styles.mockupLine} style={{width:'60%'}} />
                    <div className={styles.mockupLine} style={{width:'70%'}} />
                  </div>
                  <div className={styles.mockupCards}>
                    {[1,2,3].map(n => (
                      <div key={n} className={styles.mockupCard}>
                        <div className={styles.mockupCardIcon} style={{background: c.color}}>{c.icon}</div>
                        <div className={styles.mockupCardLines}>
                          <div className={styles.mockupLine} style={{width:'90%', height:8}} />
                          <div className={styles.mockupLine} style={{width:'60%', height:6}} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
