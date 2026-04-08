import { Avatar } from '../ui/Avatar'
import styles from './StudentItem.module.css'

const STATUS = {
  active:  { label: 'Ativo',      cls: 'statusActive'  },
  behind:  { label: 'Atrasado',   cls: 'statusBehind'  },
  'at-risk': { label: 'Em risco', cls: 'statusAtRisk'  },
}

export default function StudentItem({ name, avatar, class: cls, pct, status }) {
  const s = STATUS[status] ?? STATUS.active
  const barColor = pct >= 70 ? 'var(--success)' : pct >= 40 ? '#fbbf24' : 'var(--danger)'

  return (
    <div className={styles.item}>
      <Avatar initial={avatar} bg="var(--accent-soft)" color="var(--accent)" size={38} />

      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{name}</span>
          <span className={`${styles.status} ${styles[s.cls]}`}>{s.label}</span>
        </div>
        <span className={styles.class}>{cls}</span>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${pct}%`, background: barColor }} />
        </div>
      </div>

      <span className={styles.pct} style={{ color: barColor }}>{pct}%</span>
    </div>
  )
}
