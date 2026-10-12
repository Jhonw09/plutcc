import { stats } from '../data/stats'
import styles from './Stats.module.css'

function StatItem({ stat }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statIcon}>{stat.icon}</span>
      <div className={styles.statValue}>{stat.value}</div>
      <div className={styles.statLabel}>{stat.label}</div>
    </div>
  )
}

export default function Stats() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {stats.map((s, i) => <StatItem key={i} stat={s} />)}
        </div>
      </div>
    </section>
  )
}
