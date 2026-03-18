import { Trash2 } from 'lucide-react'
import { translations } from '../../i18n'
import styles from './HistoryItem.module.css'

export default function HistoryItem({ item, onSelect, onDelete, isActive, lang }) {
  const tr = translations[lang || 'pt-BR'].results
  const trH = translations[lang || 'pt-BR'].history
  const isBatch = item.type === 'batch' || item.type === 'gmail'
  const isProductive = !isBatch && item.result?.data?.classification === 'PRODUTIVO'
  const priority = item.result?.data?.priority
  const priorityColor = { ALTA: 'var(--high)', MEDIA: 'var(--medium)', BAIXA: 'var(--low)' }[priority] || 'var(--text-faint)'
  const priorityLabel = { ALTA: tr.high, MEDIA: tr.medium, BAIXA: tr.low }[priority] || priority
  const classLabel = isBatch
    ? `${item.count} ${trH.emails}`
    : isProductive ? tr.productive : tr.unproductive
  const dotColor = isBatch ? 'var(--accent-blue)' : isProductive ? 'var(--productive)' : 'var(--unproductive)'

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.button} ${isActive ? styles.buttonActive : ''}`}
        onClick={() => onSelect(item)}
        type="button"
        aria-current={isActive ? 'true' : undefined}
        aria-label={`${classLabel}: ${item.label}`}
      >
        <div className={styles.topRow}>
          <div className={styles.topRowLeft}>
            <div className={styles.dot} style={{ background: dotColor }} aria-hidden="true" />
            <span className={styles.classLabel}>{classLabel}</span>
          </div>
          <div className={styles.topRowRight}>
            {!isBatch && priority && (
              <span className={styles.priorityLabel} style={{ color: priorityColor }}>
                {priorityLabel}
              </span>
            )}
            {!isBatch && (
              <span className={styles.confidence}>
                {Math.round((item.result?.data?.confidence || 0) * 100)}%
              </span>
            )}
          </div>
        </div>
        <div className={styles.itemLabel}>{item.label}</div>
        <div className={styles.timestamp}>{item.timestamp}</div>
      </button>
      <button
        className={styles.deleteBtn}
        onClick={e => { e.stopPropagation(); onDelete(item.id) }}
        type="button"
        aria-label="Delete history item"
      >
        <Trash2 size={10} aria-hidden="true" />
      </button>
    </div>
  )
}
