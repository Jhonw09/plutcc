import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        {/* Left */}
        <div className={styles.left}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Plataforma oficial de mais de 20 mil escolas
          </div>

          <h1 className={styles.title}>
            O jeito mais<br />
            <span className={styles.titleBlue}>inteligente</span> de<br />
            estudar
          </h1>

          <p className={styles.desc}>
            Videoaulas, exercícios, simulados e trilhas personalizadas com IA. Tudo integrado com a sua escola, no seu ritmo.
          </p>

          <div className={styles.ctas}>
            <a href="#" className={styles.ctaPrimary}>
              Começar agora — é grátis
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <a href="#" className={styles.ctaSecondary}>
              <span className={styles.playBtn}>
                <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M1 1l10 6-10 6V1z" fill="white"/></svg>
              </span>
              Ver demonstração
            </a>
          </div>

          <div className={styles.trust}>
            <div className={styles.avatars}>
              {['#1a56db','#ff6900','#057a55','#7c3aed'].map((c,i) => (
                <div key={i} className={styles.avatar} style={{background:c, zIndex:4-i}}>
                  {['A','B','C','D'][i]}
                </div>
              ))}
            </div>
            <div className={styles.trustText}>
              <div className={styles.stars}>★★★★★</div>
              <span>+5 milhões de alunos satisfeitos</span>
            </div>
          </div>
        </div>

        {/* Right — App mockup */}
        <div className={styles.right}>
          <div className={styles.phone}>
            <div className={styles.phoneNotch} />
            <div className={styles.phoneScreen}>
              {/* Header */}
              <div className={styles.appHeader}>
                <div className={styles.appGreeting}>
                  <span className={styles.appGreetingText}>Olá, <strong>Lucas</strong> 👋</span>
                  <span className={styles.appDate}>Segunda, 14 Jul</span>
                </div>
                <div className={styles.appAvatar}>L</div>
              </div>

              {/* Progress card */}
              <div className={styles.progressCard}>
                <div className={styles.progressTop}>
                  <span>Meta semanal</span>
                  <span className={styles.progressPct}>72%</span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{width:'72%'}} />
                </div>
                <span className={styles.progressSub}>36 de 50 questões</span>
              </div>

              {/* Subject list */}
              <div className={styles.appSection}>Continuar estudando</div>
              {[
                { icon:'📐', name:'Matemática', topic:'Funções Quadráticas', pct:68, color:'#dbeafe' },
                { icon:'⚗️', name:'Química', topic:'Reações Orgânicas', pct:45, color:'#d1fae5' },
                { icon:'📖', name:'Português', topic:'Interpretação Textual', pct:91, color:'#fef3c7' },
              ].map((s,i) => (
                <div key={i} className={styles.subjectRow}>
                  <div className={styles.subjectIcon} style={{background:s.color}}>{s.icon}</div>
                  <div className={styles.subjectInfo}>
                    <span className={styles.subjectName}>{s.name}</span>
                    <span className={styles.subjectTopic}>{s.topic}</span>
                  </div>
                  <div className={styles.subjectPct}>{s.pct}%</div>
                </div>
              ))}

              {/* Bottom nav */}
              <div className={styles.appNav}>
                {['🏠','📚','📊','👤'].map((ic,i) => (
                  <button key={i} className={`${styles.appNavBtn} ${i===0?styles.appNavActive:''}`}>{ic}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className={styles.float1}>
            <span>🏆</span>
            <div>
              <strong>Sequência de 7 dias!</strong>
              <p>Continue assim</p>
            </div>
          </div>
          <div className={styles.float2}>
            <span>⚡</span>
            <div>
              <strong>+120 pts hoje</strong>
              <p>Novo recorde!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wave bottom */}
      <div className={styles.wave}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" fill="white">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"/>
        </svg>
      </div>
    </section>
  )
}
