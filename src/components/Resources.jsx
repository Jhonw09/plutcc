import { useNavigate } from 'react-router-dom'
import { resources } from '../data'
import Icon from './ui/Icon'
import styles from './Resources.module.css'

export default function Resources() {
  const navigate = useNavigate()
  return (
    <section className={styles.section} id="recursos">
      <div className={styles.container}>

        <div className={styles.header}>
          <span className="section-tag">O que oferecemos</span>
          <h2 className="section-title">O que você encontra no StudyConnect</h2>
          <p className="section-sub">
            Trilhas de aprendizagem, aulas e acompanhamento de progresso — tudo em um só lugar.
          </p>
        </div>

        <div className={styles.grid}>
          {resources.map((r) => (
            <div key={r.id} className={styles.card}>

              <div className={styles.cardTop}>
                <span className={styles.cardIcon}><Icon name={r.icon} size={32} /></span>
                <h3 className={styles.cardName}>{r.name}</h3>
                <p className={styles.cardDesc}>{r.desc}</p>
              </div>

              <ul className={styles.featureList}>
                {r.features.map((f) => (
                  <li key={f.text} className={styles.featureItem}>
                    <span className={styles.featureIcon}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>

              <a
                href="/cadastro"
                className={`${styles.cta} ${
                  r.ctaStyle === 'primary' ? styles.ctaPrimary : styles.ctaOutline
                }`}
                onClick={e => { e.preventDefault(); navigate('/cadastro') }}
              >
                {r.cta}
              </a>
            </div>
          ))}
        </div>

        <div className={styles.note}>
          {['Cadastro gratuito', 'Sem cartão de crédito', 'Acesso imediato'].map(t => (
            <span key={t} style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {t}
            </span>
          ))}
        </div>

      </div>
    </section>
  )
}
