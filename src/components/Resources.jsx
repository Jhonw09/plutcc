import { useNavigate } from 'react-router-dom'
import { resources } from '../data'
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
                <span className={styles.cardIcon}>{r.icon}</span>
                <h3 className={styles.cardName}>{r.name}</h3>
                <p className={styles.cardDesc}>{r.desc}</p>
              </div>

              <ul className={styles.featureList}>
                {r.features.map((f) => (
                  <li key={f.text} className={styles.featureItem}>
                    <span className={styles.featureIcon}>✓</span>
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

        <p className={styles.note}>
          ✅ Sem cadastro obrigatório &nbsp;·&nbsp; ✅ Sem cartão de crédito &nbsp;·&nbsp; ✅ 100% gratuito
        </p>

      </div>
    </section>
  )
}
