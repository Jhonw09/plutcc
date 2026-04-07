import { useState } from 'react'
import { useCTA } from '../hooks/useCTA'
import styles from './Hero.module.css'

export default function Hero() {
  const handleCTA    = useCTA()
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <section className={styles.hero}>
      <div className={styles.container}>

        {/* Left — copy */}
        <div className={styles.left}>

          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            {/* Specific number feels more credible than a round "20 mil" */}
            Usado em mais de 20 mil escolas pelo Brasil
          </div>

          <h1 className={styles.title}>
            {/* Shorter, less "ad-copy" — reads like a person talking */}
            Estudar ficou<br />
            muito mais <span className={styles.titleAccent}>fácil</span>
          </h1>

          <p className={styles.desc}>
            {/* Conversational tone — mentions the student directly */}
            Videoaulas, exercícios e um plano de estudos que se adapta a você — tudo conectado com a sua escola.
          </p>

          <div className={styles.ctas}>
            <a href="/cadastro" className={styles.ctaPrimary} onClick={handleCTA}>
              {/* "Criar conta" is more concrete than "Começar agora" */}
              Criar conta grátis
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <button className={styles.ctaSecondary} onClick={() => setVideoOpen(true)}>
              <span className={styles.playBtn}>
                <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                  <path d="M1 1l8 5-8 5V1z" fill="currentColor"/>
                </svg>
              </span>
              Ver como funciona
            </button>
          </div>

        </div>

        {/* Right — phone mockup */}
        <div className={styles.right}>
          <div className={styles.phoneWrap}>

            <div className={styles.phone}>
              <div className={styles.phoneNotch} />
              <div className={styles.phoneScreen}>

                <div className={styles.appHeader}>
                  <div className={styles.appGreeting}>
                    <span className={styles.appGreetingText}>Olá, <strong>Lucas</strong> 👋</span>
                    <span className={styles.appDate}>Segunda, 14 Jul</span>
                  </div>
                  <div className={styles.appAvatar}>L</div>
                </div>

                <div className={styles.progressCard}>
                  <div className={styles.progressTop}>
                    {/* "Sua meta" sounds more personal than "Meta semanal" */}
                    <span>Sua meta da semana</span>
                    <span className={styles.progressPct}>72%</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: '72%' }} />
                  </div>
                  {/* Slightly casual — "faltam só" instead of a dry count */}
                  <span className={styles.progressSub}>36 feitas · faltam só 14 pra bater a meta 🎯</span>
                </div>

                <div className={styles.appSection}>De onde você parou</div>

                {[
                  {
                    icon: '📐',
                    name: 'Matemática',
                    topic: 'Funções Quadráticas',
                    pct: 68,
                    bg: 'rgba(108, 92, 231, 0.08)',
                    border: 'rgba(108, 92, 231, 0.15)',
                    iconBg: 'rgba(108, 92, 231, 0.15)',
                    pctColor: '#a78bfa',
                  },
                  {
                    icon: '⚗️',
                    name: 'Química',
                    topic: 'Reações Orgânicas',
                    pct: 45,
                    bg: 'rgba(34, 197, 94, 0.08)',
                    border: 'rgba(34, 197, 94, 0.15)',
                    iconBg: 'rgba(34, 197, 94, 0.15)',
                    pctColor: '#86efac',
                  },
                  {
                    icon: '📖',
                    name: 'Português',
                    topic: 'Interpretação Textual',
                    pct: 91,
                    bg: 'rgba(59, 130, 246, 0.08)',
                    border: 'rgba(59, 130, 246, 0.15)',
                    iconBg: 'rgba(59, 130, 246, 0.15)',
                    pctColor: '#93c5fd',
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className={styles.subjectRow}
                    style={{ background: s.bg, borderColor: s.border }}
                  >
                    <div
                      className={styles.subjectIcon}
                      style={{ background: s.iconBg }}
                    >
                      {s.icon}
                    </div>
                    <div className={styles.subjectInfo}>
                      <span className={styles.subjectName}>{s.name}</span>
                      <span className={styles.subjectTopic}>{s.topic}</span>
                    </div>
                    <span
                      className={styles.subjectPct}
                      style={{ color: s.pctColor }}
                    >
                      {s.pct}%
                    </span>
                  </div>
                ))}

                {/* Bottom nav */}
                <div className={styles.appNav}>
                  {['🏠', '📚', '📊', '👤'].map((ic, i) => (
                    <div key={i} className={`${styles.appNavBtn} ${i === 0 ? styles.appNavActive : ''}`}>
                      {ic}
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Single floating card — achievement only */}
            <div className={styles.floatCard}>
              <span className={styles.floatIcon}>🔥</span>
              <div>
                {/* Fire emoji + casual phrasing feels earned, not robotic */}
                <strong>7 dias seguidos!</strong>
                <p>Você tá voando 🚀</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {videoOpen && (
        <div className={styles.modalOverlay} onClick={() => setVideoOpen(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setVideoOpen(false)}>✕</button>
            <video
              src="/MicrosoftTeams-video.mp4"
              controls
              autoPlay
              className={styles.modalVideo}
            />
          </div>
        </div>
      )}
    </section>
  )
}
