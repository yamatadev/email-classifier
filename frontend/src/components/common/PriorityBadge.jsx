import { translations } from '../../i18n'
import styles from './PriorityBadge.module.css'

export default function PriorityBadge({ priority, lang }) {
  const tr = translations[lang || 'pt-BR'].results
  const config = {
    ALTA: { label: tr.high, className: 'high' },
    MEDIA: { label: tr.medium, className: 'medium' },
    BAIXA: { label: tr.low, className: 'low' },
  }
  const c = config[priority] || config.BAIXA

  return (
    <span
      className={`${styles.badge} ${styles[c.className]}`}
      role="status"
      aria-label={c.label}
    >
      {c.label}
    </span>
  )
}
