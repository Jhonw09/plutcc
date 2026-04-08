import { tagStyle } from '../../utils/subjectColors'
import styles from './Tag.module.css'

/**
 * Colored badge for subject and level values.
 * Color is derived entirely from subjectColors.tagStyle — no hardcoded values here.
 *
 * @param {string} value  - e.g. 'Matemática', 'Médio'
 * @param {'sm'|'md'}  size  - 'sm' (default) for inline use, 'md' for headers
 */
export function Tag({ value, size = 'sm' }) {
  return (
    <span
      className={`${styles.tag} ${size === 'md' ? styles.md : styles.sm}`}
      style={tagStyle(value)}
    >
      {value}
    </span>
  )
}
