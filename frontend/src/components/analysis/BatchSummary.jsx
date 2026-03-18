import { translations } from '../../i18n'
import styles from './BatchSummary.module.css'

export default function BatchSummary({ results, lang }) {
  const tr = translations[lang || 'pt-BR'].batch
  const total = results.length
  const productive = results.filter(r => r.success && r.data?.classification === 'PRODUTIVO').length
  const unproductive = results.filter(r => r.success && r.data?.classification === 'IMPRODUTIVO').length
  const failed = results.filter(r => !r.success).length
  const successItems = results.filter(r => r.success)
  const avgConf = successItems.length > 0
    ? Math.round(successItems.reduce((a, r) => a + (r.data?.confidence || 0), 0) / successItems.length * 100)
    : 0

  const stats = [
    { label: tr.total, val: total, color: 'var(--text-primary)' },
    { label: tr.productive, val: productive, color: 'var(--productive)' },
    { label: tr.unproductive, val: unproductive, color: 'var(--unproductive)' },
    { label: tr.avgConfidence, val: `${avgConf}%`, color: 'var(--accent-blue)' },
    ...(failed > 0 ? [{ label: tr.errors, val: failed, color: 'var(--high)' }] : []),
  ]

  return (
    <div className={styles.bar} role="region" aria-label="Batch summary">
      {stats.map((s, i) => (
        <div key={i} className={styles.stat}>
          <div className={styles.value} style={{ color: s.color }}>{s.val}</div>
          <div className={styles.label}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}
