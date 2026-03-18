import { useState } from 'react'
import {
  Mail, Key, Eye, EyeOff,
  ChevronUp, ChevronDown, AlertCircle
} from 'lucide-react'
import { translations } from '../../i18n'
import styles from './GmailTab.module.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function GmailTab({ onResults, lang }) {
  const [gmailUser, setGmailUser] = useState('')
  const [appPassword, setAppPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showGuide, setShowGuide] = useState(false)

  const tg = translations[lang || 'pt-BR'].gmail

  const handleFetch = async () => {
    if (!gmailUser || !appPassword) { setError(tg.errorEmpty); return }
    setLoading(true)
    setError('')
    try {
      const resp = await fetch(`${API_BASE}/gmail/fetch-and-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (localStorage.getItem('mailsense_api_key') || ''),
        },
        body: JSON.stringify({ email: gmailUser, app_password: appPassword, limit, lang }),
      })
      if (!resp.ok) throw new Error((await resp.json()).detail || 'Erro ao conectar ao Gmail')
      const data = await resp.json()
      onResults(data.results, `Gmail: ${gmailUser}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = !loading && gmailUser && appPassword

  return (
    <div className={styles.wrapper}>
      {/* Guide accordion */}
      <div className={styles.guideCard}>
        <button
          className={styles.guideToggle}
          onClick={() => setShowGuide(v => !v)}
          type="button"
          aria-expanded={showGuide}
          aria-controls="gmail-guide"
        >
          <span className={styles.guideToggleLabel}>{tg.guideTitle}</span>
          {showGuide
            ? <ChevronUp size={13} color="var(--text-muted)" aria-hidden="true" />
            : <ChevronDown size={13} color="var(--text-muted)" aria-hidden="true" />}
        </button>
        {showGuide && (
          <div className={styles.guideBody} id="gmail-guide" role="region">
            {tg.guideSteps.map((step, i) => (
              <div key={i} className={styles.guideStep}>
                <span className={styles.guideStepNum}>{i + 1}.</span>
                <span className={styles.guideStepText}>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email field */}
      <div>
        <label className={styles.fieldLabel} htmlFor="gmail-email">{tg.emailLabel}</label>
        <div className={styles.inputWrapper}>
          <Mail size={14} color="var(--text-muted)" className={styles.inputIcon} aria-hidden="true" />
          <input
            id="gmail-email"
            type="email"
            value={gmailUser}
            onChange={e => setGmailUser(e.target.value)}
            placeholder={tg.emailPlaceholder}
            className={`${styles.input} ${styles.inputWithIcon}`}
            autoComplete="email"
          />
        </div>
      </div>

      {/* App Password field */}
      <div>
        <label className={styles.fieldLabel} htmlFor="gmail-password">{tg.passwordLabel}</label>
        <div className={styles.inputWrapper}>
          <Key size={14} color="var(--text-muted)" className={styles.inputIcon} aria-hidden="true" />
          <input
            id="gmail-password"
            type={showPass ? 'text' : 'password'}
            value={appPassword}
            onChange={e => setAppPassword(e.target.value)}
            placeholder={tg.passwordPlaceholder}
            className={`${styles.input} ${styles.inputPassword}`}
            autoComplete="off"
          />
          <button
            className={styles.togglePassBtn}
            onClick={() => setShowPass(v => !v)}
            type="button"
            aria-label={showPass ? 'Hide password' : 'Show password'}
          >
            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* Limit selector */}
      <div>
        <label className={styles.fieldLabel}>{tg.quantityLabel}</label>
        <div className={styles.limitRow}>
          {[5, 10].map(n => (
            <button
              key={n}
              onClick={() => setLimit(n)}
              type="button"
              className={`${styles.limitBtn} ${limit === n ? styles.limitBtnActive : styles.limitBtnDefault}`}
              aria-pressed={limit === n}
            >
              {n} emails
            </button>
          ))}
        </div>
        <p className={styles.limitHint}>{tg.limitHint}</p>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.error} role="alert">
          <AlertCircle size={13} color="var(--high)" className={styles.errorIcon} aria-hidden="true" />
          <span className={styles.errorText}>{error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleFetch}
        disabled={!canSubmit}
        type="button"
        className={`${styles.submitBtn} ${canSubmit ? styles.submitBtnEnabled : styles.submitBtnDisabled}`}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <div className={styles.spinner} aria-hidden="true" />
            {tg.fetching}
          </>
        ) : (
          <>
            <Mail size={14} aria-hidden="true" /> {tg.fetchButton}
          </>
        )}
      </button>
    </div>
  )
}
