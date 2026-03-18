import { translations } from '../../i18n'
import styles from './ConfidenceBar.module.css'

export default function ConfidenceBar({ value, lang }) {
  const tr = translations[lang || 'pt-BR'].results
  const pct = Math.round(value * 100)
  const level = pct >= 80 ? 'high' : pct >= 50 ? 'mid' : 'low'

  return (
    <div
      className={styles.wrapper}
      role="meter"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${tr.confidence}: ${pct}%`}
    >
      <div className={styles.header}>
        <span className={styles.label}>{tr.confidence}</span>
        <span className={`${styles.value} ${styles[level]}`}>{pct}%</span>
      </div>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${styles[level]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
