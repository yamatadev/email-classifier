import { Zap, Globe, LogOut, User } from 'lucide-react'
import { translations } from '../../i18n'
import { useApp } from '../../context/AppContext'
import styles from './Header.module.css'

function LangToggle() {
  const { lang, setLang } = useApp()
  const isPT = lang === 'pt-BR'

  return (
    <button
      className={styles.langToggle}
      onClick={() => setLang(isPT ? 'en-US' : 'pt-BR')}
      title={isPT ? 'Switch to English' : 'Mudar para Português'}
      aria-label={isPT ? 'Switch to English' : 'Mudar para Português'}
    >
      <Globe size={12} color="var(--accent-blue)" />
      <span className={styles.langCurrent}>
        {isPT ? '\u{1F1E7}\u{1F1F7} PT' : '\u{1F1FA}\u{1F1F8} EN'}
      </span>
      <span className={styles.langArrow}>&rarr;</span>
      <span className={styles.langAlt}>
        {isPT ? '\u{1F1FA}\u{1F1F8} EN' : '\u{1F1E7}\u{1F1F7} PT'}
      </span>
    </button>
  )
}

export default function Header({ onLogout }) {
  const { lang, user, totalAnalyzed, avgConfidence } = useApp()
  const t = translations[lang]

  return (
    <header className={styles.header} role="banner">
      {/* Logo */}
      <div className={styles.logoGroup}>
        <div className={styles.logoIcon} aria-hidden="true">
          <Zap size={13} color="white" />
        </div>
        <div>
          <div className={styles.logoTitle}>MailSense</div>
          <div className={styles.logoTagline}>{t.header.tagline}</div>
        </div>
      </div>

      {/* Stats */}
      {totalAnalyzed > 0 && (
        <div className={styles.stats} aria-label="Analysis statistics">
          <div className={styles.statItem}>
            <div className={styles.statValue}>{totalAnalyzed}</div>
            <div className={styles.statLabel}>{t.header.analyzed}</div>
          </div>
          <div className={styles.statItem}>
            <div className={`${styles.statValue} ${styles.statValueBlue}`}>{avgConfidence}%</div>
            <div className={styles.statLabel}>{t.header.avgConfidence}</div>
          </div>
        </div>
      )}

      {/* Right controls */}
      <div className={styles.controls}>
        <LangToggle />

        {user && (
          <div className={styles.userInfo} aria-label={`Logged in as ${user.name}`}>
            <div className={styles.avatar} aria-hidden="true">
              <User size={12} color="var(--text-secondary)" />
            </div>
            <div>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userRole}>{t.login.roles[user.roleKey] || user.roleKey}</div>
            </div>
          </div>
        )}

        <button
          className={styles.logoutBtn}
          onClick={onLogout}
          aria-label={t.header.logout}
        >
          <LogOut size={12} /> {t.header.logout}
        </button>
      </div>
    </header>
  )
}
