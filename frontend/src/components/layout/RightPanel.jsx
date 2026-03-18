import { Info, Shield } from 'lucide-react'
import { translations } from '../../i18n'
import { useApp } from '../../context/AppContext'
import styles from './RightPanel.module.css'

export default function RightPanel() {
  const { lang } = useApp()
  const t = translations[lang]
  const year = new Date().getFullYear()

  return (
    <aside className={styles.panel} role="complementary" aria-label="Info">
      {/* Categories */}
      <div>
        <div className={styles.sectionTitle}>
          <Info size={10} color="var(--text-muted)" />
          <span>{t.panel.categories}</span>
        </div>
        {[
          { type: 'PRODUTIVO', label: t.results.productive, color: 'var(--productive)', desc: t.panel.productiveDesc },
          { type: 'IMPRODUTIVO', label: t.results.unproductive, color: 'var(--unproductive)', desc: t.panel.unproductiveDesc },
        ].map(c => (
          <div key={c.type} className={styles.categoryItem}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryDot} style={{ background: c.color }} />
              <span className={styles.categoryLabel}>{c.label}</span>
            </div>
            <p className={styles.categoryDesc}>{c.desc}</p>
          </div>
        ))}
      </div>

      <div className={styles.divider} />

      {/* Pipeline */}
      <div>
        <div className={styles.sectionTitle}>
          <Shield size={10} color="var(--text-muted)" />
          <span>{t.panel.pipeline}</span>
        </div>
        {t.panel.pipelineSteps.map((step, i) => (
          <div key={i} className={styles.pipelineStep}>
            <span className={styles.stepNum}>{String(i + 1).padStart(2, '0')}</span>
            <span className={styles.stepText}>{step}</span>
          </div>
        ))}
      </div>

      <div className={styles.divider} />

      {/* Modes */}
      <div>
        <div className={styles.sectionLabel}>{t.panel.modes}</div>
        {t.panel.modesList.map((m, i) => (
          <div key={i} className={`${styles.modeItem} ${i >= 2 ? (i === 2 ? styles.modeBlue : styles.modeGreen) : ''}`}>
            <span className={styles.modeArrow}>&#9656; </span>{m}
          </div>
        ))}
      </div>

      <div className={styles.divider} />

      {/* Stack */}
      <div>
        <div className={styles.sectionLabel}>{t.panel.stack}</div>
        {['FastAPI · Python', 'Claude Haiku', 'NLTK · RSLP', 'React · Vite', 'Gmail IMAP'].map((s, i) => (
          <div key={i} className={styles.stackItem}>
            <span className={styles.modeArrow}>&#9656; </span>{s}
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        MailSense · YamataDev &copy; {year}
      </div>
    </aside>
  )
}
