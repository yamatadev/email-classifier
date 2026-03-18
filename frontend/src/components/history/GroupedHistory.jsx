import { translations } from '../../i18n'
import HistoryItem from './HistoryItem'
import styles from './GroupedHistory.module.css'

const PRIORITY_ORDER = { ALTA: 0, MEDIA: 1, BAIXA: 2 }

function sortByPriority(items) {
  return [...items].sort(
    (a, b) =>
      (PRIORITY_ORDER[a.result?.data?.priority] ?? 9) -
      (PRIORITY_ORDER[b.result?.data?.priority] ?? 9)
  )
}

function GroupLabel({ color, label, count }) {
  return (
    <div className={styles.groupLabel} role="heading" aria-level={3}>
      <div className={styles.groupDot} style={{ background: color }} aria-hidden="true" />
      <span className={styles.groupName}>{label}</span>
      <span className={styles.groupCount}>{count}</span>
    </div>
  )
}

export default function GroupedHistory({ history, onSelect, onDelete, activeHistoryId, lang }) {
  const tr = translations[lang || 'pt-BR'].history

  if (history.length === 0) {
    return <div className={styles.empty}>{tr.empty}</div>
  }

  const singleItems = history.filter(h => h.type === 'single')
  const batchItems = history.filter(h => h.type === 'batch' || h.type === 'gmail')

  const productive = sortByPriority(
    singleItems.filter(h => h.result?.data?.classification === 'PRODUTIVO')
  )
  const unproductive = sortByPriority(
    singleItems.filter(h => h.result?.data?.classification === 'IMPRODUTIVO')
  )

  return (
    <nav aria-label={tr.title}>
      {productive.length > 0 && (
        <section>
          <GroupLabel color="var(--productive)" label={tr.productive} count={productive.length} />
          {productive.map(item => (
            <HistoryItem
              key={item.id}
              item={item}
              onSelect={onSelect}
              onDelete={onDelete}
              isActive={item.id === activeHistoryId}
              lang={lang}
            />
          ))}
        </section>
      )}
      {unproductive.length > 0 && (
        <section>
          <GroupLabel color="var(--unproductive)" label={tr.unproductive} count={unproductive.length} />
          {unproductive.map(item => (
            <HistoryItem
              key={item.id}
              item={item}
              onSelect={onSelect}
              onDelete={onDelete}
              isActive={item.id === activeHistoryId}
              lang={lang}
            />
          ))}
        </section>
      )}
      {batchItems.length > 0 && (
        <section>
          <GroupLabel color="var(--accent-blue)" label={tr.batch} count={batchItems.length} />
          {batchItems.map(item => (
            <HistoryItem
              key={item.id}
              item={item}
              onSelect={onSelect}
              onDelete={onDelete}
              isActive={item.id === activeHistoryId}
              lang={lang}
            />
          ))}
        </section>
      )}
    </nav>
  )
}
