import { translations } from '../../i18n'
import styles from './Badge.module.css'

export default function Badge({ type, lang }) {
  const tr = translations[lang || 'pt-BR'].results
  const config = {
    PRODUTIVO: {
      label: tr.productive,
      colorVar: 'productive',
    },
    IMPRODUTIVO: {
      label: tr.unproductive,
      colorVar: 'unproductive',
    },
  }
  const c = config[type] || config.IMPRODUTIVO

  return (
    <span
      className={`${styles.badge} ${styles[c.colorVar]}`}
      role="status"
      aria-label={c.label}
    >
      <span className={styles.dot} aria-hidden="true" />
      {c.label}
    </span>
  )
}
