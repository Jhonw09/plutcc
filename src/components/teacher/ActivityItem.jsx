import styles from './ActivityItem.module.css'

export default function ActivityItem({ icon, student, action, time, color }) {
  return (
    <div className={styles.item}>
      <span className={styles.dot} style={{ background: color }} />
      <span className={styles.icon}>{icon}</span>
      <p className={styles.text}>
        <strong className={styles.student}>{student}</strong> {action}
      </p>
      <span className={styles.time}>{time}</span>
    </div>
  )
}
