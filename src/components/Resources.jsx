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
          <span className="section-tag">Recursos gratuitos</span>
          <h2 className="section-title">Tudo que você precisa, 100% grátis</h2>
          <p className="section-sub">
            Acesse videoaulas, simulados e trilhas personalizadas com IA — sem pagar nada.
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
          {['Sem cadastro obrigatório', 'Sem cartão de crédito', '100% gratuito'].map(t => (
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
