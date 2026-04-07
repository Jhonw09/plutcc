import styles from './StatCard.module.css'

export default function StatCard({ icon, label, value, delta, deltaPositive }) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.icon}>{icon}</span>
        <span className={`${styles.delta} ${
          deltaPositive === true  ? styles.deltaUp   :
          deltaPositive === false ? styles.deltaDown : styles.deltaNeutral
        }`}>{delta}</span>
      </div>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  )
}
