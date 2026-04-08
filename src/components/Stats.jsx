import { useCountUp } from '../hooks/useCountUp'
import { stats, logos } from '../data/stats'
import styles from './Stats.module.css'

function StatItem({ stat }) {
  const { ref, value } = useCountUp(stat.value)
  return (
    <div ref={ref} className={styles.stat}>
      <div className={styles.statValue}>
        {stat.format(value)}<span className={styles.suffix}>{stat.suffix}</span>
      </div>
      <div className={styles.statLabel}>{stat.label}</div>
    </div>
  )
}

export default function Stats() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>

        {/* Stats row */}
        <div className={styles.grid}>
          {stats.map((s, i) => <StatItem key={i} stat={s} />)}
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Logos row */}
        {/* Plain language — "confiam" is warmer than "confiado pelas maiores redes" */}
        <p className={styles.logosLabel}>Escolas e redes de ensino que já usam a plataforma</p>
        <div className={styles.track}>
          <div className={styles.logos}>
            {[...logos, ...logos].map((l, i) => (
              <div key={i} className={styles.logo}>
                <div
                  className={styles.logoIcon}
                  style={{
                    backgroundColor: `color-mix(in srgb, ${l.color} 18%, transparent)`,
                    color: l.color,
                    borderColor: `color-mix(in srgb, ${l.color} 30%, transparent)`,
                  }}
                >
                  {l.name[0]}
                </div>
                <span className={styles.logoName}>{l.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
