import { Clock, Trash2 } from 'lucide-react'
import { translations } from '../../i18n'
import { useApp } from '../../context/AppContext'
import styles from './Sidebar.module.css'

const PRIORITY_ORDER = { ALTA: 0, MEDIA: 1, BAIXA: 2 }

function HistoryItem({ item, onSelect, onDelete, isActive, lang }) {
  const tr = translations[lang || 'pt-BR'].results
  const isBatch = item.type === 'batch' || item.type === 'gmail'
  const isProductive = !isBatch && item.result?.data?.classification === 'PRODUTIVO'
  const priority = item.result?.data?.priority
  const priorityColor = { ALTA: 'var(--high)', MEDIA: 'var(--medium)', BAIXA: 'var(--low)' }[priority] || 'var(--text-faint)'
  const priorityLabel = { ALTA: tr.high, MEDIA: tr.medium, BAIXA: tr.low }[priority] || priority
  const classLabel = isProductive ? tr.productive : tr.unproductive

  const dotColor = isBatch
    ? 'var(--accent-blue)'
    : isProductive
      ? 'var(--productive)'
      : 'var(--unproductive)'

  return (
    <div className={styles.historyItemWrapper}>
      <button
        className={`${styles.historyBtn} ${isActive ? styles.historyBtnActive : ''}`}
        onClick={() => onSelect(item)}
        aria-current={isActive ? 'true' : undefined}
        aria-label={`${isBatch ? `${item.count} emails` : classLabel} - ${item.label}`}
      >
        <div className={styles.historyRow}>
          <div className={styles.historyLeft}>
            <span
              className={styles.historyDot}
              style={{ background: dotColor }}
              aria-hidden="true"
            />
            <span className={styles.historyType}>
              {isBatch ? `${item.count} emails` : classLabel}
            </span>
          </div>
          <div className={styles.historyMeta}>
            {!isBatch && priority && (
              <span className={styles.historyPriority} style={{ color: priorityColor }}>
                {priorityLabel}
              </span>
            )}
            {!isBatch && (
              <span className={styles.historyConf}>
                {Math.round((item.result?.data?.confidence || 0) * 100)}%
              </span>
            )}
          </div>
        </div>
        <div className={styles.historyLabel}>{item.label}</div>
        <div className={styles.historyTime}>{item.timestamp}</div>
      </button>
      <button
        className={styles.deleteBtn}
        onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
        aria-label="Delete history item"
      >
        <Trash2 size={10} />
      </button>
    </div>
  )
}

function GroupLabel({ color, label, count }) {
  return (
    <div className={styles.groupLabel}>
      <span className={styles.groupDot} style={{ background: color }} aria-hidden="true" />
      <span className={styles.groupText}>{label}</span>
      <span className={styles.groupCount}>{count}</span>
    </div>
  )
}

function GroupedHistory({ history, onSelect, onDelete, activeHistoryId, lang }) {
  const tr = translations[lang || 'pt-BR'].history

  const singleItems = history.filter(h => h.type === 'single')
  const batchItems = history.filter(h => h.type === 'batch' || h.type === 'gmail')

  const productive = singleItems
    .filter(h => h.result?.data?.classification === 'PRODUTIVO')
    .sort((a, b) => (PRIORITY_ORDER[a.result?.data?.priority] ?? 9) - (PRIORITY_ORDER[b.result?.data?.priority] ?? 9))

  const unproductive = singleItems
    .filter(h => h.result?.data?.classification === 'IMPRODUTIVO')
    .sort((a, b) => (PRIORITY_ORDER[a.result?.data?.priority] ?? 9) - (PRIORITY_ORDER[b.result?.data?.priority] ?? 9))

  if (history.length === 0) {
    return (
      <div className={styles.emptyHistory} role="status">
        {tr.empty}
      </div>
    )
  }

  return (
    <>
      {productive.length > 0 && (
        <>
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
        </>
      )}
      {unproductive.length > 0 && (
        <>
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
        </>
      )}
      {batchItems.length > 0 && (
        <>
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
        </>
      )}
    </>
  )
}

export default function Sidebar({ onSelectHistory }) {
  const { lang, history, activeHistoryId, setActiveHistoryId, deleteHistoryItem } = useApp()
  const t = translations[lang]

  const handleSelect = (item) => {
    setActiveHistoryId(item.id)
    if (onSelectHistory) onSelectHistory(item)
  }

  const handleDelete = (id) => {
    deleteHistoryItem(id)
  }

  return (
    <aside className={styles.sidebar} role="complementary" aria-label={t.history.title}>
      <div className={styles.sidebarHeader}>
        <Clock size={10} color="var(--text-muted)" aria-hidden="true" />
        <span className={styles.sidebarTitle}>{t.history.title}</span>
      </div>
      <GroupedHistory
        history={history}
        onSelect={handleSelect}
        onDelete={handleDelete}
        activeHistoryId={activeHistoryId}
        lang={lang}
      />
    </aside>
  )
}
