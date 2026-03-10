import { useState, useRef, useCallback } from 'react'
import {
  Upload, FileText, Send, Copy, Check,
  AlertCircle, Clock, TrendingUp, TrendingDown,
  Zap, Shield, BarChart3, X, RotateCcw, Info,
  MessageSquare, LogOut, User, Mail, Key,
  ChevronDown, ChevronUp, Layers, Eye, EyeOff, Trash2, Globe, ArrowRight
} from 'lucide-react'
import { translations } from '../i18n'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ─── Language Toggle (compact, for header) ───────────────────────────────

function LangToggle({ lang, setLang }) {
  const isPT = lang === 'pt-BR'
  return (
    <button
      onClick={() => setLang(isPT ? 'en-US' : 'pt-BR')}
      title={isPT ? 'Switch to English' : 'Mudar para Português'}
      style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: '7px 12px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '100px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.background = 'rgba(59,130,246,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-surface)' }}
    >
      <Globe size={12} color="var(--accent-blue)" />
      <span style={{ fontSize: '11px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', letterSpacing: '0.06em' }}>
        {isPT ? '🇧🇷 PT' : '🇺🇸 EN'}
      </span>
      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>→</span>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
        {isPT ? '🇺🇸 EN' : '🇧🇷 PT'}
      </span>
    </button>
  )
}

// ─── Small Utilities ──────────────────────────────────────────────────────

const PRIORITY_ORDER = { ALTA: 0, MEDIA: 1, BAIXA: 2 }

function Badge({ type, lang }) {
  const tr = translations[lang || 'pt-BR'].results
  const config = {
    PRODUTIVO: { label: tr.productive, color: 'var(--productive)', bg: 'var(--productive-glow)', border: 'var(--productive-border)' },
    IMPRODUTIVO: { label: tr.unproductive, color: 'var(--unproductive)', bg: 'var(--unproductive-glow)', border: 'var(--unproductive-border)' },
  }
  const c = config[type] || config.IMPRODUTIVO
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, animation: 'pulse-glow 2s ease-in-out infinite' }} />
      {c.label}
    </span>
  )
}

function PriorityBadge({ priority, lang }) {
  const tr = translations[lang || 'pt-BR'].results
  const config = {
    ALTA:  { color: 'var(--high)',   label: tr.high },
    MEDIA: { color: 'var(--medium)', label: tr.medium },
    BAIXA: { color: 'var(--low)',    label: tr.low },
  }
  const c = config[priority] || config.BAIXA
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: '500', fontFamily: 'var(--font-mono)', color: c.color, background: `${c.color}18`, border: `1px solid ${c.color}30` }}>
      {c.label}
    </span>
  )
}

function ConfidenceBar({ value, lang }) {
  const tr = translations[lang || 'pt-BR'].results
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? 'var(--productive)' : pct >= 50 ? 'var(--accent-blue)' : 'var(--unproductive)'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tr.confidence}</span>
        <span style={{ fontSize: '12px', fontWeight: '600', color, fontFamily: 'var(--font-mono)' }}>{pct}%</span>
      </div>
      <div style={{ height: '3px', background: 'var(--bg-void)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: `0 0 6px ${color}80` }} />
      </div>
    </div>
  )
}

function CopyButton({ text, lang }) {
  const [copied, setCopied] = useState(false)
  const tr = translations[lang || 'pt-BR'].results
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', background: 'transparent', color: copied ? 'var(--productive)' : 'var(--text-secondary)', fontSize: '11px', fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
      {copied ? <><Check size={11} /> {tr.copied}</> : <><Copy size={11} /> {tr.copy}</>}
    </button>
  )
}

// ─── Result Card (single email) ───────────────────────────────────────────

function ResultCard({ data, filename, subject, sender, collapsed = false, onDelete, lang }) {
  const [open, setOpen] = useState(!collapsed)
  const tr = translations[lang || 'pt-BR'].results
  const isProductive = data.classification === 'PRODUTIVO'
  const label = subject || filename || 'Email analisado'

  return (
    <div style={{ border: `1px solid ${isProductive ? 'var(--productive-border)' : 'var(--unproductive-border)'}`, borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
      <div onClick={() => setOpen(v => !v)} style={{ padding: '14px 18px', background: isProductive ? 'var(--productive-glow)' : 'var(--unproductive-glow)', borderBottom: open ? `1px solid ${isProductive ? 'var(--productive-border)' : 'var(--unproductive-border)'}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: isProductive ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isProductive ? <TrendingUp size={14} color="var(--productive)" /> : <TrendingDown size={14} color="var(--unproductive)" />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
            {sender && <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{sender}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <Badge type={data.classification} lang={lang} />
          <PriorityBadge priority={data.priority} lang={lang} />
          {onDelete && (
            <button onClick={e => { e.stopPropagation(); onDelete() }} title="Remover" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: 'var(--radius-sm)', transition: 'color 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--high)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <Trash2 size={13} />
            </button>
          )}
          <div style={{ color: 'var(--text-muted)' }}>{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</div>
        </div>
      </div>

      {open && (
        <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', alignItems: 'start' }}>
            <ConfidenceBar value={data.confidence} lang={lang} />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>{tr.reason}</div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{data.reason}</p>
            </div>
          </div>

          {data.key_topics?.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {data.key_topics.map((topic, i) => (
                <span key={i} style={{ padding: '3px 9px', borderRadius: '100px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{topic}</span>
              ))}
            </div>
          )}

          <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <MessageSquare size={12} color="var(--text-muted)" />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tr.suggestedResponse}</span>
                {data.suggested_subject && <span style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '2px 7px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>{data.suggested_subject}</span>}
              </div>
              <CopyButton text={data.suggested_response} lang={lang} />
            </div>
            <div style={{ padding: '14px', background: 'var(--bg-base)' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.75', whiteSpace: 'pre-wrap' }}>{data.suggested_response}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Batch Summary Bar ────────────────────────────────────────────────────

function BatchSummary({ results, lang }) {
  const tr = translations[lang || 'pt-BR'].batch
  const total = results.length
  const productive = results.filter(r => r.success && r.data?.classification === 'PRODUTIVO').length
  const unproductive = results.filter(r => r.success && r.data?.classification === 'IMPRODUTIVO').length
  const failed = results.filter(r => !r.success).length
  const avgConf = results.filter(r => r.success).length > 0
    ? Math.round(results.filter(r => r.success).reduce((a, r) => a + (r.data?.confidence || 0), 0) / results.filter(r => r.success).length * 100) : 0

  return (
    <div style={{ display: 'flex', gap: '0', padding: '14px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', marginBottom: '16px' }}>
      {[
        { label: tr.total, val: total, color: 'var(--text-primary)' },
        { label: tr.productive, val: productive, color: 'var(--productive)' },
        { label: tr.unproductive, val: unproductive, color: 'var(--unproductive)' },
        { label: tr.avgConfidence, val: `${avgConf}%`, color: 'var(--accent-blue)' },
        ...(failed > 0 ? [{ label: tr.errors, val: failed, color: 'var(--high)' }] : []),
      ].map((s, i, arr) => (
        <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none', padding: '0 16px' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: s.color, fontFamily: 'var(--font-mono)' }}>{s.val}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Upload Zone ───────────────────────────────────────────────────────────

function UploadZone({ onFiles, isDragging, setIsDragging, multiple = false, lang }) {
  const inputRef = useRef()
  const ti = translations[lang || 'pt-BR'].input
  const handleDrop = useCallback(e => {
    e.preventDefault(); setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) onFiles(files)
  }, [onFiles, setIsDragging])

  return (
    <div onClick={() => inputRef.current?.click()} onDrop={handleDrop}
      onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      style={{ padding: '28px', borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'center', border: `1.5px dashed ${isDragging ? 'var(--accent-blue)' : 'var(--border-default)'}`, background: isDragging ? 'var(--accent-blue-glow)' : 'transparent', transition: 'all 0.2s ease' }}>
      <input ref={inputRef} type="file" accept=".txt,.pdf" multiple={multiple} hidden onChange={e => { const files = Array.from(e.target.files || []); if (files.length) onFiles(files) }} />
      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
        {multiple ? <Layers size={18} color="var(--text-secondary)" /> : <Upload size={18} color="var(--text-secondary)" />}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
        {multiple ? ti.dragFiles : ti.dragFile} <span style={{ color: 'var(--accent-blue)' }}>{ti.clickSelect}</span>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        {multiple ? ti.fileHintMultiple : ti.fileHintSingle}
      </div>
    </div>
  )
}

// ─── Gmail Tab ────────────────────────────────────────────────────────────

function GmailTab({ onResults, lang }) {
  const [gmailUser, setGmailUser] = useState('')
  const [appPassword, setAppPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showGuide, setShowGuide] = useState(false)

  const tg = translations[lang].gmail

  const handleFetch = async () => {
    if (!gmailUser || !appPassword) { setError(tg.errorEmpty); return }
    setLoading(true); setError('')
    try {
      const resp = await fetch(`${API_BASE}/gmail/fetch-and-analyze`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: gmailUser, app_password: appPassword, limit, lang }),
      })
      if (!resp.ok) throw new Error((await resp.json()).detail || 'Erro ao conectar ao Gmail')
      const data = await resp.json()
      onResults(data.results, `Gmail: ${gmailUser}`)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const inputStyle = { width: '100%', padding: '11px 14px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--font-body)', outline: 'none' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
        <button onClick={() => setShowGuide(v => !v)} style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-elevated)', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{tg.guideTitle}</span>
          {showGuide ? <ChevronUp size={13} color="var(--text-muted)" /> : <ChevronDown size={13} color="var(--text-muted)" />}
        </button>
        {showGuide && (
          <div style={{ padding: '14px', background: 'var(--bg-base)', borderTop: '1px solid var(--border-subtle)' }}>
            {tg.guideSteps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)', minWidth: 16, marginTop: '2px' }}>{i + 1}.</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', letterSpacing: '0.05em' }}>EMAIL GMAIL</label>
        <div style={{ position: 'relative' }}>
          <Mail size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input type="email" value={gmailUser} onChange={e => setGmailUser(e.target.value)} placeholder="seu@gmail.com"
            style={{ ...inputStyle, paddingLeft: '36px' }} />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', letterSpacing: '0.05em' }}>{tg.passwordLabel}</label>
        <div style={{ position: 'relative' }}>
          <Key size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input type={showPass ? 'text' : 'password'} value={appPassword} onChange={e => setAppPassword(e.target.value)} placeholder={tg.passwordPlaceholder}
            style={{ ...inputStyle, paddingLeft: '36px', paddingRight: '40px', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }} />
          <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', letterSpacing: '0.05em' }}>{tg.quantityLabel}</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[5, 10].map(n => (
            <button key={n} onClick={() => setLimit(n)} style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)', border: `1px solid ${limit === n ? 'var(--accent-blue)' : 'var(--border-default)'}`, background: limit === n ? 'var(--accent-blue-glow)' : 'transparent', color: limit === n ? 'var(--accent-blue)' : 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
              {n} emails
            </button>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
          {tg.limitHint}
        </p>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <AlertCircle size={13} color="var(--high)" style={{ marginTop: '1px', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: '#FCA5A5', lineHeight: '1.5' }}>{error}</span>
        </div>
      )}

      <button onClick={handleFetch} disabled={loading || !gmailUser || !appPassword} style={{ padding: '11px', borderRadius: 'var(--radius-md)', border: 'none', background: (!loading && gmailUser && appPassword) ? 'var(--accent-blue)' : 'var(--bg-elevated)', color: (!loading && gmailUser && appPassword) ? 'white' : 'var(--text-muted)', fontSize: '14px', fontWeight: '600', cursor: (!loading && gmailUser && appPassword) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease', boxShadow: (!loading && gmailUser && appPassword) ? '0 0 20px rgba(59,130,246,0.3)' : 'none' }}>
        {loading ? (
          <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />{tg.fetching}</>
        ) : <><Mail size={14} /> {tg.fetchButton}</>}
      </button>
    </div>
  )
}

// ─── History Item ──────────────────────────────────────────────────────────

function HistoryItem({ item, onSelect, onDelete, isActive, lang }) {
  const tr = translations[lang || 'pt-BR'].results
  const isBatch = item.type === 'batch' || item.type === 'gmail'
  const isProductive = !isBatch && item.result?.data?.classification === 'PRODUTIVO'
  const priority = item.result?.data?.priority
  const priorityColor = { ALTA: 'var(--high)', MEDIA: 'var(--medium)', BAIXA: 'var(--low)' }[priority] || 'var(--text-faint)'
  const priorityLabel = { ALTA: tr.high, MEDIA: tr.medium, BAIXA: tr.low }[priority] || priority
  const classLabel = isProductive ? tr.productive : tr.unproductive

  return (
    <div style={{ position: 'relative' }}
      onMouseEnter={e => e.currentTarget.querySelector('.del-btn').style.opacity = '1'}
      onMouseLeave={e => e.currentTarget.querySelector('.del-btn').style.opacity = '0'}>
      <button onClick={() => onSelect(item)}
        style={{ width: '100%', textAlign: 'left', padding: '8px 10px', paddingRight: '26px', borderRadius: 'var(--radius-md)', background: isActive ? 'var(--bg-elevated)' : 'transparent', border: `1px solid ${isActive ? 'var(--border-default)' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.15s ease', display: 'flex', flexDirection: 'column', gap: '3px' }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)' }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: isBatch ? 'var(--accent-blue)' : isProductive ? 'var(--productive)' : 'var(--unproductive)' }} />
            <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {isBatch ? `${item.count} emails` : classLabel}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {!isBatch && priority && (
              <span style={{ fontSize: '9px', color: priorityColor, fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                {priorityLabel}
              </span>
            )}
            {!isBatch && <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{Math.round((item.result?.data?.confidence || 0) * 100)}%</span>}
          </div>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.label}
        </div>
        <div style={{ fontSize: '9px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{item.timestamp}</div>
      </button>
      <button className="del-btn" onClick={e => { e.stopPropagation(); onDelete(item.id) }}
        style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', opacity: 0, transition: 'opacity 0.15s ease, color 0.15s ease', borderRadius: 'var(--radius-sm)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--high)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
        <Trash2 size={10} />
      </button>
    </div>
  )
}

function GroupedHistory({ history, onSelect, onDelete, activeHistoryId, lang }) {
  const tr = translations[lang || 'pt-BR'].history
  const PRIORITY_ORDER = { ALTA: 0, MEDIA: 1, BAIXA: 2 }

  const singleItems = history.filter(h => h.type === 'single')
  const batchItems  = history.filter(h => h.type === 'batch' || h.type === 'gmail')

  const productive = singleItems
    .filter(h => h.result?.data?.classification === 'PRODUTIVO')
    .sort((a, b) => (PRIORITY_ORDER[a.result?.data?.priority] ?? 9) - (PRIORITY_ORDER[b.result?.data?.priority] ?? 9))

  const unproductive = singleItems
    .filter(h => h.result?.data?.classification === 'IMPRODUTIVO')
    .sort((a, b) => (PRIORITY_ORDER[a.result?.data?.priority] ?? 9) - (PRIORITY_ORDER[b.result?.data?.priority] ?? 9))

  if (history.length === 0) {
    return <div style={{ textAlign: 'center', padding: '28px 10px', color: 'var(--text-faint)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{tr.empty}</div>
  }

  const GroupLabel = ({ color, label, count }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px 4px', marginTop: '6px' }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em', flex: 1 }}>{label}</span>
      <span style={{ fontSize: '9px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{count}</span>
    </div>
  )

  return (
    <>
      {productive.length > 0 && (
        <>
          <GroupLabel color="var(--productive)" label={tr.productive} count={productive.length} />
          {productive.map(item => <HistoryItem key={item.id} item={item} onSelect={onSelect} onDelete={onDelete} isActive={item.id === activeHistoryId} lang={lang} />)}
        </>
      )}
      {unproductive.length > 0 && (
        <>
          <GroupLabel color="var(--unproductive)" label={tr.unproductive} count={unproductive.length} />
          {unproductive.map(item => <HistoryItem key={item.id} item={item} onSelect={onSelect} onDelete={onDelete} isActive={item.id === activeHistoryId} lang={lang} />)}
        </>
      )}
      {batchItems.length > 0 && (
        <>
          <GroupLabel color="var(--accent-blue)" label={tr.batch} count={batchItems.length} />
          {batchItems.map(item => <HistoryItem key={item.id} item={item} onSelect={onSelect} onDelete={onDelete} isActive={item.id === activeHistoryId} lang={lang} />)}
        </>
      )}
    </>
  )
}

// ─── Main App ──────────────────────────────────────────────────────────────

export default function MainApp({ user, onLogout, lang, setLang }) {
  const t = translations[lang]
  const [tab, setTab] = useState('text')
  const [text, setText] = useState('')
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)       // single result
  const [batchResults, setBatchResults] = useState(null) // batch/gmail results
  const [batchLabel, setBatchLabel] = useState('')
  const [history, setHistory] = useState([])
  const [activeHistoryId, setActiveHistoryId] = useState(null)

  const addSingleToHistory = (res, label) => {
    const item = { id: Date.now(), type: 'single', result: res, label: label?.slice(0, 40) || 'Email', timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }
    setHistory(prev => [item, ...prev].slice(0, 30))
    setActiveHistoryId(item.id)
  }

  const addBatchToHistory = (results, label, type = 'batch') => {
    const item = { id: Date.now(), type, count: results.length, label: label?.slice(0, 40) || 'Batch', timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), batchResults: results }
    setHistory(prev => [item, ...prev].slice(0, 30))
    setActiveHistoryId(item.id)
  }

  const handleReset = () => { setText(''); setFiles([]); setResult(null); setBatchResults(null); setError(null) }

  const handleSubmitSingle = async () => {
    setLoading(true); setError(null); setResult(null); setBatchResults(null)
    try {
      let res
      if (tab === 'text') {
        const resp = await fetch(`${API_BASE}/analyze/text`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, lang }) })
        if (!resp.ok) throw new Error((await resp.json()).detail || 'Erro')
        res = await resp.json()
        addSingleToHistory(res, text.slice(0, 40))
      } else {
        const fd = new FormData(); fd.append('file', files[0])
        const resp = await fetch(`${API_BASE}/analyze/file?lang=${lang}`, { method: 'POST', body: fd })
        if (!resp.ok) throw new Error((await resp.json()).detail || 'Erro')
        res = await resp.json()
        addSingleToHistory(res, files[0].name)
      }
      setResult(res)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const handleBatchSubmit = async () => {
    setLoading(true); setError(null); setResult(null); setBatchResults(null)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      const resp = await fetch(`${API_BASE}/analyze/batch?lang=${lang}`, { method: 'POST', body: fd })
      if (!resp.ok) throw new Error((await resp.json()).detail || 'Erro')
      const data = await resp.json()
      setBatchResults(data.results)
      setBatchLabel(`${files.length} arquivos`)
      addBatchToHistory(data.results, `${files.length} arquivos`)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const handleGmailResults = (results, label) => {
    setBatchResults(results); setBatchLabel(label); setResult(null)
    addBatchToHistory(results, label, 'gmail')
  }

  const handleHistorySelect = (item) => {
    setActiveHistoryId(item.id)
    if (item.type === 'single') { setResult(item.result); setBatchResults(null) }
    else { setBatchResults(item.batchResults); setBatchLabel(item.label); setResult(null) }
  }

  const handleDeleteHistory = (id) => {
    setHistory(prev => prev.filter(h => h.id !== id))
    if (activeHistoryId === id) {
      setResult(null)
      setBatchResults(null)
      setActiveHistoryId(null)
    }
  }

  const canSubmit = !loading && (
    (tab === 'text' && text.trim().length > 0) ||
    (tab === 'file' && files.length === 1) ||
    (tab === 'batch' && files.length > 0)
  )

  const totalAnalyzed = history.reduce((a, h) => a + (h.type === 'single' ? 1 : (h.count || 0)), 0)
  const avgConf = history.filter(h => h.type === 'single').length > 0
    ? Math.round(history.filter(h => h.type === 'single').reduce((a, h) => a + (h.result?.data?.confidence || 0), 0) / history.filter(h => h.type === 'single').length * 100) : 0

  const TABS = [
    { key: 'text', label: t.tabs.text, icon: <FileText size={12} /> },
    { key: 'file', label: t.tabs.file, icon: <Upload size={12} /> },
    { key: 'batch', label: t.tabs.batch, icon: <Layers size={12} /> },
    { key: 'gmail', label: t.tabs.gmail, icon: <Mail size={12} /> },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-base)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={13} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1.2 }}>MailSense</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>{t.header.tagline}</div>
          </div>
        </div>

        {totalAnalyzed > 0 && (
          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              { label: t.header.analyzed, val: totalAnalyzed, color: 'var(--text-secondary)' },
              { label: t.header.avgConfidence, val: `${avgConf}%`, color: 'var(--accent-blue)' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: s.color, fontFamily: 'var(--font-mono)' }}>{s.val}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LangToggle lang={lang} setLang={setLang} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={12} color="var(--text-secondary)" />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>{user.name}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{t.login.roles[user.roleKey] || user.roleKey}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: 'var(--radius-sm)', background: 'none', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <LogOut size={12} /> {t.header.logout}
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        {/* Sidebar */}
        <aside style={{ width: 220, flexShrink: 0, borderRight: '1px solid var(--border-subtle)', padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          <div style={{ padding: '4px 8px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={10} color="var(--text-muted)" />
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.history.title}</span>
          </div>
          <GroupedHistory history={history} onSelect={handleHistorySelect} onDelete={handleDeleteHistory} activeHistoryId={activeHistoryId} lang={lang} />
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          {/* Input Card */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', padding: '0 4px' }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => { setTab(t.key); handleReset() }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-body)', color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)', borderBottom: tab === t.key ? '2px solid var(--accent-blue)' : '2px solid transparent', transition: 'all 0.2s ease', marginBottom: '-1px' }}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Text tab */}
              {tab === 'text' && (
                <div>
                  <textarea value={text} onChange={e => setText(e.target.value)} placeholder={t.input.textPlaceholder} rows={7}
                    style={{ width: '100%', resize: 'vertical', minHeight: '140px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '14px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--font-body)', lineHeight: '1.65', outline: 'none', transition: 'border-color 0.2s ease' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-default)'} />
                  {text && <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{text.length} {t.input.chars}</div>}
                </div>
              )}

              {/* Single file tab */}
              {tab === 'file' && (
                files.length > 0 ? (
                  <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-base)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={15} color="var(--accent-blue)" />
                      <div>
                        <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{files[0].name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{(files[0].size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <button onClick={() => setFiles([])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={13} /></button>
                  </div>
                ) : <UploadZone onFiles={f => setFiles([f[0]])} isDragging={isDragging} setIsDragging={setIsDragging} lang={lang} />
              )}

              {/* Batch tab */}
              {tab === 'batch' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <UploadZone onFiles={f => setFiles(prev => [...prev, ...f].slice(0, 20))} isDragging={isDragging} setIsDragging={setIsDragging} multiple lang={lang} />
                  {files.length > 0 && (
                    <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{files.length} {t.input.filesSelected}</span>
                        <button onClick={() => setFiles([])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><X size={11} /> {t.input.clearAll}</button>
                      </div>
                      <div style={{ maxHeight: '140px', overflowY: 'auto' }}>
                        {files.map((f, i) => (
                          <div key={i} style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < files.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileText size={12} color="var(--text-muted)" />
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{f.name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{(f.size / 1024).toFixed(1)} KB</span>
                              <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={11} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Gmail tab */}
              {tab === 'gmail' && <GmailTab onResults={handleGmailResults} lang={lang} />}

              {/* Actions */}
              {tab !== 'gmail' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {(text || files.length > 0 || result || batchResults) ? (
                    <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: 'var(--radius-sm)', background: 'none', border: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <RotateCcw size={11} /> {t.input.clear}
                    </button>
                  ) : <div />}
                  <button onClick={tab === 'batch' ? handleBatchSubmit : handleSubmitSingle} disabled={!canSubmit}
                    style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: canSubmit ? 'var(--accent-blue)' : 'var(--bg-elevated)', cursor: canSubmit ? 'pointer' : 'not-allowed', color: canSubmit ? 'white' : 'var(--text-muted)', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-body)', transition: 'all 0.2s ease', boxShadow: canSubmit ? '0 0 16px rgba(59,130,246,0.3)' : 'none' }}>
                    {loading
                      ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />{t.input.analyzing}</>
                      : <><Send size={13} /> {tab === 'batch' ? `${t.input.analyzeBatch} ${files.length} ${t.input.files}` : t.input.analyze}</>}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="fade-in" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={14} color="var(--high)" />
              <span style={{ fontSize: '13px', color: '#FCA5A5' }}>{error}</span>
              <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={12} /></button>
            </div>
          )}

          {/* Single result */}
          {result && !batchResults && (
            <div className="fade-in">
              <ResultCard data={result.data} filename={result.filename} onDelete={() => { setResult(null); setActiveHistoryId(null) }} lang={lang} />
            </div>
          )}

          {/* Batch / Gmail results */}
          {batchResults && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <BatchSummary results={batchResults} lang={lang} />
              {batchResults.map((r, i) => (
                r.success
                  ? <ResultCard key={i} data={r.data} filename={r.filename} subject={r.subject} sender={r.sender} collapsed lang={lang}
                      onDelete={() => setBatchResults(prev => prev.filter((_, j) => j !== i))} />
                  : (
                    <div key={i} style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertCircle size={14} color="var(--high)" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{r.filename || r.subject || 'Arquivo'}</div>
                        <div style={{ fontSize: '11px', color: '#FCA5A5', fontFamily: 'var(--font-mono)' }}>{r.error}</div>
                      </div>
                      <button onClick={() => setBatchResults(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--high)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )
              ))}
              {batchResults.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  {t.batch.allRemoved}
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!result && !batchResults && !loading && !error && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <BarChart3 size={22} color="var(--text-faint)" />
              </div>
              <p style={{ fontSize: '14px', marginBottom: '5px', color: 'var(--text-secondary)' }}>{t.emptyState.title}</p>
              <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{t.emptyState.subtitle}</p>
            </div>
          )}
        </main>

        {/* Right Panel */}
        <aside style={{ width: 200, flexShrink: 0, borderLeft: '1px solid var(--border-subtle)', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Info size={10} color="var(--text-muted)" />
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.panel.categories}</span>
            </div>
            {[{ type: 'PRODUTIVO', label: t.results.productive, color: 'var(--productive)', desc: t.panel.productiveDesc }, { type: 'IMPRODUTIVO', label: t.results.unproductive, color: 'var(--unproductive)', desc: t.panel.unproductiveDesc }].map(c => (
              <div key={c.type} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{c.label}</span>
                </div>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', paddingLeft: '12px', lineHeight: '1.5' }}>{c.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Shield size={10} color="var(--text-muted)" />
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.panel.pipeline}</span>
            </div>
            {t.panel.pipelineSteps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '7px', marginBottom: '7px' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginTop: '2px', minWidth: 12 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{step}</span>
              </div>
            ))}
          </div>

          <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

          <div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.panel.modes}</div>
            {t.panel.modesList.map((m, i) => (
              <div key={i} style={{ fontSize: '10px', color: i >= 2 ? (i === 2 ? 'var(--accent-blue)' : 'var(--productive)') : 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '5px' }}>
                <span style={{ color: 'var(--text-faint)' }}>▸ </span>{m}
              </div>
            ))}
          </div>

          <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

          <div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.panel.stack}</div>
            {['FastAPI · Python', 'Claude claude-opus-4-5', 'NLTK · RSLP', 'React · Vite', 'Gmail IMAP'].map((s, i) => (
              <div key={i} style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '5px' }}>
                <span style={{ color: 'var(--text-faint)' }}>▸ </span>{s}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
