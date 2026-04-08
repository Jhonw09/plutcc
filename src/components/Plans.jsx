import { useState } from 'react'
import { plans } from '../data/plans'
import styles from './Plans.module.css'

export default function Plans() {
  const [annual, setAnnual] = useState(false)

  return (
    <section className={styles.section} id="planos">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="section-tag blue">Planos</span>
          <h2 className="section-title">Escolha o plano ideal para você</h2>
          <p className="section-sub">Comece grátis e evolua conforme sua necessidade. Cancele quando quiser.</p>

          <div className={styles.toggle}>
            <span className={!annual ? styles.toggleOn : styles.toggleOff}>Mensal</span>
            <button
              className={styles.toggleSwitch}
              onClick={() => setAnnual(!annual)}
              aria-label="Alternar período"
            >
              <span className={styles.toggleThumb} style={{ transform: annual ? 'translateX(22px)' : 'translateX(2px)' }} />
            </button>
            <span className={annual ? styles.toggleOn : styles.toggleOff}>
              Anual
              <span className={styles.discount}>Economize 20%</span>
            </span>
          </div>
        </div>

        <div className={styles.grid}>
          {plans.map((p) => {
            const price = p.monthlyPrice === null ? null
              : annual && p.monthlyPrice > 0 ? p.monthlyPrice * 0.8
              : p.monthlyPrice
            return (
              <div key={p.id} className={`${styles.card} ${p.badge ? styles.featured : ''}`}>
                {p.badge && <div className={styles.badge}>{p.badge}</div>}

                <div className={styles.planTop}>
                  <h3 className={styles.planName}>{p.name}</h3>
                  <div className={styles.planPrice}>
                    {price === null ? (
                      <span className={styles.priceCustom}>Sob consulta</span>
                    ) : price === 0 ? (
                      <span className={styles.priceFree}>Grátis</span>
                    ) : (
                      <>
                        <span className={styles.priceCurrency}>R$</span>
                        <span className={styles.priceValue}>{price.toFixed(2).replace('.', ',')}</span>
                        <span className={styles.pricePer}>/mês</span>
                      </>
                    )}
                  </div>
                  {annual && price !== null && price > 0 && (
                    <span className={styles.annualNote}>Cobrado anualmente</span>
                  )}
                  <p className={styles.planDesc}>{p.desc}</p>
                </div>

                <ul className={styles.featureList}>
                  {p.features.map((f, i) => (
                    <li key={i} className={f.ok ? styles.featureOk : styles.featureNo}>
                      <span className={styles.featureIcon}>{f.ok ? '✓' : '✕'}</span>
                      {f.text}
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
                  className={`${styles.cta} ${
                    p.ctaStyle === 'primary' ? styles.ctaPrimary :
                    p.ctaStyle === 'accent'  ? styles.ctaPrimary  :
                    styles.ctaOutline
                  }`}
                >
                  {p.cta}
                </a>
              </div>
            )
          })}
        </div>

        <p className={styles.note}>
          ✅ Sem taxa de adesão &nbsp;·&nbsp; ✅ Cancele quando quiser &nbsp;·&nbsp; ✅ Pagamento seguro
        </p>
      </div>
    </section>
  )
}
