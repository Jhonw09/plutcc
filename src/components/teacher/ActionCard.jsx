import styles from './ActionCard.module.css'

export default function ActionCard({ icon, label, desc, onClick }) {
  return (
    <button className={styles.card} onClick={onClick}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label}>{label}</span>
      <span className={styles.desc}>{desc}</span>
      <span className={styles.arrow}>→</span>
    </button>
  )
}
