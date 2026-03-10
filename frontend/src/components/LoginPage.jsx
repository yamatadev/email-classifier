import { useState, useEffect } from 'react'
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, Globe } from 'lucide-react'
import { translations } from '../i18n'

const DEMO_USERS = [
  { email: 'demo@autou.com.br', password: 'autou2025', name: 'Demo User', role: 'Analista Financeiro' },
  { email: 'admin@autou.com.br', password: 'admin123', name: 'Admin', role: 'Gestor de Operações' },
]

// ─── Language Toggle ──────────────────────────────────────────────────────

function LangToggle({ lang, setLang }) {
  const isPT = lang === 'pt-BR'
  const t = translations[lang].login

  return (
    <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}>
      <button
        onClick={() => setLang(isPT ? 'en-US' : 'pt-BR')}
        title={t.langHint}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 16px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '100px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--accent-blue)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.2)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border-default)'
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <Globe size={14} color="var(--accent-blue)" strokeWidth={2} />

        {/* Current lang pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>{isPT ? '🇧🇷' : '🇺🇸'}</span>
          <span style={{
            fontSize: '11px', fontWeight: '700', fontFamily: 'var(--font-mono)',
            color: 'var(--text-primary)', letterSpacing: '0.06em',
          }}>
            {isPT ? 'PT-BR' : 'EN-US'}
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />

        {/* Switch to label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>{isPT ? '🇺🇸' : '🇧🇷'}</span>
          <span style={{
            fontSize: '11px', fontWeight: '500', fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)', letterSpacing: '0.04em',
          }}>
            {isPT ? 'EN-US' : 'PT-BR'}
          </span>
        </div>

        {/* Arrow indicator */}
        <ArrowRight size={11} color="var(--text-muted)" strokeWidth={2.5} />
      </button>

      {/* Hint label below button */}
      <div style={{
        textAlign: 'center', marginTop: '6px',
        fontSize: '10px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)',
        letterSpacing: '0.04em',
      }}>
        {t.langHint}
      </div>
    </div>
  )
}

// ─── Animated Background ──────────────────────────────────────────────────

function AnimatedBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        animation: 'grid-move 8s linear infinite',
        maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
      }} />
      {[
        { w: 400, h: 400, x: '-10%', y: '10%', color: 'rgba(59,130,246,0.12)', delay: '0s', dur: '12s' },
        { w: 300, h: 300, x: '60%', y: '50%', color: 'rgba(6,182,212,0.08)', delay: '-4s', dur: '15s' },
        { w: 250, h: 250, x: '30%', y: '-5%', color: 'rgba(99,102,241,0.10)', delay: '-8s', dur: '10s' },
      ].map((o, i) => (
        <div key={i} style={{
          position: 'absolute', width: o.w, height: o.h, left: o.x, top: o.y,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          animation: `float-orb ${o.dur} ease-in-out ${o.delay} infinite`,
        }} />
      ))}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
        background: 'linear-gradient(to top, var(--bg-void), transparent)',
      }} />
    </div>
  )
}

// ─── Left Branding Panel ──────────────────────────────────────────────────

function BrandPanel({ lang }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])
  const t = translations[lang].login

  return (
    <div style={{
      flex: 1, position: 'relative', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '60px',
      background: 'linear-gradient(135deg, #060A17 0%, #0A1128 60%, #0D1535 100%)',
      overflow: 'hidden',
    }}>
      <AnimatedBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div className="logo-reveal" style={{
          display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '56px',
          opacity: visible ? 1 : 0,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px rgba(59,130,246,0.4)',
          }}>
            <Zap size={20} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              MailSense
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {t.tagline}
            </div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ marginBottom: '40px', opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.2s' }}>
          <h1 style={{
            fontSize: '42px', fontWeight: '800', fontFamily: 'var(--font-display)',
            lineHeight: 1.1, letterSpacing: '-0.03em',
            color: 'var(--text-primary)', marginBottom: '16px',
          }}>
            {t.headline1}{' '}
            <span style={{
              background: 'linear-gradient(90deg, #3B82F6, #06B6D4, #3B82F6)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', animation: 'shimmer 3s linear infinite',
            }}>
              {t.headline2}
            </span>
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.65', maxWidth: '380px' }}>
            {t.description}
          </p>
        </div>

        {/* Features */}
        <div style={{ marginBottom: '48px', opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.35s' }}>
          {t.features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-blue)' }} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: '0',
          borderTop: '1px solid var(--border-subtle)', paddingTop: '32px',
          opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.5s',
        }}>
          {t.stats.map((s, i) => (
            <div key={i} style={{
              flex: 1, paddingRight: '24px',
              borderRight: i < t.stats.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              paddingLeft: i > 0 ? '24px' : '0',
            }}>
              <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '3px' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Login Form ───────────────────────────────────────────────────────────

export default function LoginPage({ onLogin, lang, setLang }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const t = translations[lang].login

  // Clear error when switching language
  useEffect(() => { setError('') }, [lang])

  const handleSubmit = async () => {
    if (!email || !password) { setError(t.errorEmpty); return }
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 900))
    const user = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (user) { onLogin({ ...user, lang }) }
    else { setError(t.errorInvalid); setLoading(false) }
  }

  const handleKeyDown = e => { if (e.key === 'Enter') handleSubmit() }

  const inputStyle = (field) => ({
    width: '100%', padding: '13px 16px 13px 44px',
    background: focusedField === field ? 'rgba(59,130,246,0.05)' : 'var(--bg-base)',
    border: `1px solid ${focusedField === field ? 'var(--accent-blue)' : 'var(--border-default)'}`,
    borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
    fontSize: '14px', fontFamily: 'var(--font-body)', outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-void)' }}>
      <BrandPanel lang={lang} />

      {/* Right: Form */}
      <div style={{
        width: '480px', flexShrink: 0, position: 'relative',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 48px',
        background: 'var(--bg-base)',
        borderLeft: '1px solid var(--border-subtle)',
      }}>

        {/* Language Toggle — prominent, top right */}
        <LangToggle lang={lang} setLang={setLang} />

        <div className="auth-enter">
          {/* Header */}
          <div style={{ marginBottom: '40px', marginTop: '40px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              {t.welcomeBack}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              {t.accessAccount}
            </p>
          </div>

          {/* Demo hint */}
          <div style={{
            padding: '12px 16px', borderRadius: 'var(--radius-md)',
            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
            marginBottom: '28px',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)', marginBottom: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {t.demoAccess}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {t.demoHint}
            </div>
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px', letterSpacing: '0.05em' }}>
                {t.emailLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color={focusedField === 'email' ? 'var(--accent-blue)' : 'var(--text-muted)'}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', transition: 'color 0.2s ease' }} />
                <input type="email" value={email} placeholder={t.emailPlaceholder}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                  onKeyDown={handleKeyDown} style={inputStyle('email')} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px', letterSpacing: '0.05em' }}>
                {t.passwordLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color={focusedField === 'pass' ? 'var(--accent-blue)' : 'var(--text-muted)'}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', transition: 'color 0.2s ease' }} />
                <input type={showPass ? 'text' : 'password'} value={password} placeholder={t.passwordPlaceholder}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('pass')} onBlur={() => setFocusedField(null)}
                  onKeyDown={handleKeyDown} style={{ ...inputStyle('pass'), paddingRight: '44px' }} />
                <button onClick={() => setShowPass(v => !v)} style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px',
                }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '20px',
            }}>
              <AlertCircle size={13} color="var(--high)" style={{ marginTop: '1px', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#FCA5A5', lineHeight: '1.5' }}>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            style={{
              width: '100%', padding: '14px',
              borderRadius: 'var(--radius-md)', border: 'none',
              background: loading ? 'var(--bg-elevated)' : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              color: loading ? 'var(--text-muted)' : 'white',
              fontSize: '15px', fontWeight: '600', fontFamily: 'var(--font-body)',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.35)',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(59,130,246,0.45)' } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; if (!loading) e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.35)' }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                {t.verifying}
              </>
            ) : (
              <>{t.enter} <ArrowRight size={16} /></>
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginTop: '28px' }}>
            {t.footer}
          </p>
        </div>
      </div>
    </div>
  )
}
