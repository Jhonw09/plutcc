import { useState } from 'react'
import styles from './Testimonials.module.css'

const testimonials = [
  {
    name: 'Ana Beatriz Santos',
    role: 'Aprovada em Medicina — USP',
    text: 'O Plurall foi fundamental na minha aprovação. As videoaulas são incríveis e os simulados me prepararam muito bem. Estudei pelo app no ônibus, em casa, em todo lugar.',
    avatar: 'A',
    color: '#1a56db',
    school: 'Colégio Objetivo',
  },
  {
    name: 'Carlos Eduardo Melo',
    role: 'Aprovado no ITA',
    text: 'A plataforma é muito completa. O banco de questões é enorme e as trilhas personalizadas me ajudaram a focar exatamente no que eu precisava estudar para o ITA.',
    avatar: 'C',
    color: '#ff6900',
    school: 'Colégio Anglo',
  },
  {
    name: 'Juliana Ferreira',
    role: 'Aprovada em Direito — UNICAMP',
    text: 'O que mais gostei foi poder estudar no meu ritmo. Os relatórios de desempenho me mostraram onde eu estava errando e consegui melhorar muito rápido.',
    avatar: 'J',
    color: '#057a55',
    school: 'Colégio Poliedro',
  },
  {
    name: 'Pedro Henrique Lima',
    role: 'Aprovado em Engenharia — FUVEST',
    text: 'Recomendo para todos! A integração com a escola é perfeita. Meu professor enviava as tarefas pelo Plurall e eu conseguia acompanhar tudo em um só lugar.',
    avatar: 'P',
    color: '#7c3aed',
    school: 'Colégio COC',
  },
]

export default function Testimonials() {
  const [active, setActive] = useState(0)

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="section-tag blue">Depoimentos</span>
          <h2 className="section-title">Quem usa o Plurall, aprova</h2>
          <p className="section-sub">Veja o que nossos alunos dizem sobre a plataforma que transformou seus estudos.</p>
        </div>

        <div className={styles.layout}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            {testimonials.map((t, i) => (
              <button
                key={i}
                className={`${styles.sideItem} ${active === i ? styles.sideActive : ''}`}
                onClick={() => setActive(i)}
              >
                <div className={styles.sideAvatar} style={{ background: t.color }}>{t.avatar}</div>
                <div className={styles.sideInfo}>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Main card */}
          <div className={styles.card}>
            <div className={styles.stars}>★★★★★</div>
            <blockquote className={styles.quote}>
              "{testimonials[active].text}"
            </blockquote>
            <div className={styles.author}>
              <div className={styles.authorAvatar} style={{ background: testimonials[active].color }}>
                {testimonials[active].avatar}
              </div>
              <div>
                <strong className={styles.authorName}>{testimonials[active].name}</strong>
                <span className={styles.authorRole}>{testimonials[active].role}</span>
                <span className={styles.authorSchool}>📍 {testimonials[active].school}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile dots */}
        <div className={styles.dots}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${active === i ? styles.dotActive : ''}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
