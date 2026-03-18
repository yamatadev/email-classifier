import { Globe, ArrowRight } from 'lucide-react'
import { translations } from '../../i18n'
import styles from './LangToggle.module.css'

/**
 * Shared language toggle button.
 *
 * @param {Object} props
 * @param {string} props.lang          - Current language code ('pt-BR' | 'en-US')
 * @param {Function} props.setLang     - Setter for language
 * @param {'compact'|'full'} [props.variant='compact'] - Visual variant
 */
export default function LangToggle({ lang, setLang, variant = 'compact' }) {
  const isPT = lang === 'pt-BR'
  const t = translations[lang].login

  const toggle = () => setLang(isPT ? 'en-US' : 'pt-BR')

  if (variant === 'full') {
    return (
      <div className={styles.fullWrapper}>
        <button
          className={styles.fullButton}
          onClick={toggle}
          title={t.langHint}
          type="button"
          aria-label={t.langHint}
        >
          <Globe size={14} color="var(--accent-blue)" strokeWidth={2} aria-hidden="true" />

          {/* Current language */}
          <div className={styles.langGroup}>
            <span className={styles.flag} aria-hidden="true">{isPT ? '\u{1F1E7}\u{1F1F7}' : '\u{1F1FA}\u{1F1F8}'}</span>
            <span className={styles.fullCurrentLabel}>
              {isPT ? 'PT-BR' : 'EN-US'}
            </span>
          </div>

          {/* Divider */}
          <div className={styles.divider} aria-hidden="true" />

          {/* Target language */}
          <div className={styles.langGroup}>
            <span className={styles.flag} aria-hidden="true">{isPT ? '\u{1F1FA}\u{1F1F8}' : '\u{1F1E7}\u{1F1F7}'}</span>
            <span className={styles.fullTargetLabel}>
              {isPT ? 'EN-US' : 'PT-BR'}
            </span>
          </div>

          {/* Arrow */}
          <ArrowRight size={11} color="var(--text-muted)" strokeWidth={2.5} aria-hidden="true" />
        </button>

        {/* Hint text below */}
        <div className={styles.hint}>{t.langHint}</div>
      </div>
    )
  }

  // Compact variant (header)
  return (
    <button
      className={styles.compactButton}
      onClick={toggle}
      title={isPT ? 'Switch to English' : 'Mudar para Portugu\u00EAs'}
      type="button"
      aria-label={isPT ? 'Switch to English' : 'Mudar para Portugu\u00EAs'}
    >
      <Globe size={12} color="var(--accent-blue)" aria-hidden="true" />
      <span className={styles.compactCurrent}>
        {isPT ? '\u{1F1E7}\u{1F1F7} PT' : '\u{1F1FA}\u{1F1F8} EN'}
      </span>
      <span className={styles.compactArrow} aria-hidden="true">\u2192</span>
      <span className={styles.compactTarget}>
        {isPT ? '\u{1F1FA}\u{1F1F8} EN' : '\u{1F1E7}\u{1F1F7} PT'}
      </span>
    </button>
  )
}
