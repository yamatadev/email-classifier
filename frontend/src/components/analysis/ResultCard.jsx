import { useState } from 'react'
import {
  TrendingUp, TrendingDown, ChevronUp, ChevronDown,
  Trash2, MessageSquare
} from 'lucide-react'
import { translations } from '../../i18n'
import Badge from '../common/Badge'
import PriorityBadge from '../common/PriorityBadge'
import ConfidenceBar from '../common/ConfidenceBar'
import CopyButton from '../common/CopyButton'
import styles from './ResultCard.module.css'

export default function ResultCard({ data, filename, subject, sender, collapsed = false, onDelete, lang }) {
  const [open, setOpen] = useState(!collapsed)
  const tr = translations[lang || 'pt-BR'].results
  const isProductive = data.classification === 'PRODUTIVO'
  const label = subject || filename || 'Email analisado'

  return (
    <div
      className={`${styles.card} ${isProductive ? styles.cardProductive : styles.cardUnproductive}`}
      role="article"
      aria-label={label}
    >
      {/* Header */}
      <div
        className={[
          styles.header,
          isProductive ? styles.headerProductive : styles.headerUnproductive,
          open ? (isProductive ? styles.headerOpenProductive : styles.headerOpenUnproductive) : '',
        ].join(' ')}
        onClick={() => setOpen(v => !v)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(v => !v) } }}
      >
        <div className={styles.headerLeft}>
          <div className={`${styles.iconBox} ${isProductive ? styles.iconBoxProductive : styles.iconBoxUnproductive}`}>
            {isProductive
              ? <TrendingUp size={14} color="var(--productive)" aria-hidden="true" />
              : <TrendingDown size={14} color="var(--unproductive)" aria-hidden="true" />}
          </div>
          <div className={styles.labelWrap}>
            <div className={styles.label}>{label}</div>
            {sender && <div className={styles.sender}>{sender}</div>}
          </div>
        </div>

        <div className={styles.headerRight}>
          <Badge type={data.classification} lang={lang} />
          <PriorityBadge priority={data.priority} lang={lang} />
          {onDelete && (
            <button
              className={styles.deleteBtn}
              onClick={e => { e.stopPropagation(); onDelete() }}
              title="Remover"
              aria-label="Remover resultado"
              type="button"
            >
              <Trash2 size={13} aria-hidden="true" />
            </button>
          )}
          <div className={styles.chevron} aria-hidden="true">
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* Expandable body */}
      {open && (
        <div className={styles.body}>
          {/* Confidence + Reason grid */}
          <div className={styles.detailGrid}>
            <ConfidenceBar value={data.confidence} lang={lang} />
            <div>
              <div className={styles.reasonLabel}>{tr.reason}</div>
              <p className={styles.reasonText}>{data.reason}</p>
            </div>
          </div>

          {/* Topics */}
          {data.key_topics?.length > 0 && (
            <div className={styles.topics} role="list" aria-label={tr.topics}>
              {data.key_topics.map((topic, i) => (
                <span key={i} className={styles.topicPill} role="listitem">{topic}</span>
              ))}
            </div>
          )}

          {/* Suggested Response */}
          <div className={styles.responseCard}>
            <div className={styles.responseHeader}>
              <div className={styles.responseHeaderLeft}>
                <MessageSquare size={12} color="var(--text-muted)" aria-hidden="true" />
                <span className={styles.responseLabel}>{tr.suggestedResponse}</span>
                {data.suggested_subject && (
                  <span className={styles.responseSubject}>{data.suggested_subject}</span>
                )}
              </div>
              <CopyButton text={data.suggested_response} lang={lang} />
            </div>
            <div className={styles.responseBody}>
              <p className={styles.responseText}>{data.suggested_response}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
