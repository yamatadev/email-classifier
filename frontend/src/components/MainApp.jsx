import { useState, useRef, useCallback } from 'react'
import {
  Upload, FileText, Send, Copy, Check,
  AlertCircle, Clock, TrendingUp, TrendingDown,
  Zap, Shield, BarChart3, X, RotateCcw, Info,
  MessageSquare, LogOut, User, Mail, Key,
  ChevronDown, ChevronUp, Layers, Eye, EyeOff, Trash2
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ─── Small Utilities ──────────────────────────────────────────────────────

function Badge({ type }) {
  const config = {
    PRODUTIVO: { label: 'Produtivo', color: 'var(--productive)', bg: 'var(--productive-glow)', border: 'var(--productive-border)' },
    IMPRODUTIVO: { label: 'Improdutivo', color: 'var(--unproductive)', bg: 'var(--unproductive-glow)', border: 'var(--unproductive-border)' },
  }
  const c = config[type] || config.IMPRODUTIVO
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, animation: 'pulse-glow 2s ease-in-out infinite' }} />
      {c.label}
    </span>
  )
}

function PriorityBadge({ priority }) {
  const config = { ALTA: { color: 'var(--high)', label: 'Alta' }, MEDIA: { color: 'var(--medium)', label: 'Média' }, BAIXA: { color: 'var(--low)', label: 'Baixa' } }
  const c = config[priority] || config.BAIXA
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: '500', fontFamily: 'var(--font-mono)', color: c.color, background: `${c.color}18`, border: `1px solid ${c.color}30` }}>
      {c.label}
    </span>
  )
}

function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? 'var(--productive)' : pct >= 50 ? 'var(--accent-blue)' : 'var(--unproductive)'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Confiança</span>
        <span style={{ fontSize: '12px', fontWeight: '600', color, fontFamily: 'var(--font-mono)' }}>{pct}%</span>
      </div>
      <div style={{ height: '3px', background: 'var(--bg-void)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: `0 0 6px ${color}80` }} />
      </div>
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', background: 'transparent', color: copied ? 'var(--productive)' : 'var(--text-secondary)', fontSize: '11px', fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
      {copied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
    </button>
  )
}

// ─── Result Card (single email) ───────────────────────────────────────────

function ResultCard({ data, filename, subject, sender, collapsed = false, onDelete }) {
  const [open, setOpen] = useState(!collapsed)
  const isProductive = data.classification === 'PRODUTIVO'
  const label = subject || filename || 'Email analisado'

  return (
    <div style={{ border: `1px solid ${isProductive ? 'var(--productive-border)' : 'var(--unproductive-border)'}`, borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
      {/* Header — always visible */}
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
          <Badge type={data.classification} />
          <PriorityBadge priority={data.priority} />
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

      {/* Body — collapsible */}
      {open && (
        <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', alignItems: 'start' }}>
            <ConfidenceBar value={data.confidence} />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Justificativa</div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{data.reason}</p>
            </div>
          </div>

          {data.key_topics?.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {data.key_topics.map((t, i) => (
                <span key={i} style={{ padding: '3px 9px', borderRadius: '100px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{t}</span>
              ))}
            </div>
          )}

          <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <MessageSquare size={12} color="var(--text-muted)" />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resposta Sugerida</span>
                {data.suggested_subject && <span style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '2px 7px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>{data.suggested_subject}</span>}
              </div>
              <CopyButton text={data.suggested_response} />
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

function BatchSummary({ results }) {
  const total = results.length
  const productive = results.filter(r => r.success && r.data?.classification === 'PRODUTIVO').length
  const unproductive = results.filter(r => r.success && r.data?.classification === 'IMPRODUTIVO').length
  const failed = results.filter(r => !r.success).length
  const avgConf = results.filter(r => r.success).length > 0
    ? Math.round(results.filter(r => r.success).reduce((a, r) => a + (r.data?.confidence || 0), 0) / results.filter(r => r.success).length * 100) : 0

  return (
    <div style={{ display: 'flex', gap: '0', padding: '14px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', marginBottom: '16px' }}>
      {[
        { label: 'Total', val: total, color: 'var(--text-primary)' },
        { label: 'Produtivos', val: productive, color: 'var(--productive)' },
        { label: 'Improdutivos', val: unproductive, color: 'var(--unproductive)' },
        { label: 'Confiança avg', val: `${avgConf}%`, color: 'var(--accent-blue)' },
        ...(failed > 0 ? [{ label: 'Erros', val: failed, color: 'var(--high)' }] : []),
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

function UploadZone({ onFiles, isDragging, setIsDragging, multiple = false }) {
  const inputRef = useRef()
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
        Arraste {multiple ? 'os arquivos' : 'um arquivo'} ou <span style={{ color: 'var(--accent-blue)' }}>clique para selecionar</span>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        .TXT · .PDF · máx 5MB{multiple ? ' · até 20 arquivos' : ''}
      </div>
    </div>
  )
}

// ─── Gmail Tab ────────────────────────────────────────────────────────────

function GmailTab({ onResults }) {
  const [gmailUser, setGmailUser] = useState('')
  const [appPassword, setAppPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showGuide, setShowGuide] = useState(false)

  const handleFetch = async () => {
    if (!gmailUser || !appPassword) { setError('Preencha email e App Password.'); return }
    setLoading(true); setError('')
    try {
      const resp = await fetch(`${API_BASE}/gmail/fetch-and-analyze`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: gmailUser, app_password: appPassword, limit }),
      })
      if (!resp.ok) throw new Error((await resp.json()).detail || 'Erro ao conectar ao Gmail')
      const data = await resp.json()
      onResults(data.results, `Gmail: ${gmailUser}`)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const inputStyle = { width: '100%', padding: '11px 14px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--font-body)', outline: 'none' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* How to get App Password */}
      <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
        <button onClick={() => setShowGuide(v => !v)} style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-elevated)', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Como obter o App Password do Gmail?</span>
          {showGuide ? <ChevronUp size={13} color="var(--text-muted)" /> : <ChevronDown size={13} color="var(--text-muted)" />}
        </button>
        {showGuide && (
          <div style={{ padding: '14px', background: 'var(--bg-base)', borderTop: '1px solid var(--border-subtle)' }}>
            {[
              'Acesse myaccount.google.com → Segurança',
              'Clique em "Verificação em duas etapas" e ATIVE (obrigatório)',
              'Após ativar, volte em Segurança e role para baixo',
              'Clique em "Senhas de app" (só aparece com 2FA ativo)',
              'Digite um nome como "MailSense" e clique em Criar',
              'Copie a senha de 16 caracteres gerada',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)', minWidth: 16, marginTop: '2px' }}>{i + 1}.</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fields */}
      <div>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', letterSpacing: '0.05em' }}>EMAIL GMAIL</label>
        <div style={{ position: 'relative' }}>
          <Mail size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input type="email" value={gmailUser} onChange={e => setGmailUser(e.target.value)} placeholder="seu@gmail.com"
            style={{ ...inputStyle, paddingLeft: '36px' }} />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', letterSpacing: '0.05em' }}>APP PASSWORD</label>
        <div style={{ position: 'relative' }}>
          <Key size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input type={showPass ? 'text' : 'password'} value={appPassword} onChange={e => setAppPassword(e.target.value)} placeholder="xxxx xxxx xxxx xxxx"
            style={{ ...inputStyle, paddingLeft: '36px', paddingRight: '40px', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }} />
          <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', letterSpacing: '0.05em' }}>QUANTIDADE DE EMAILS</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[5, 10].map(n => (
            <button key={n} onClick={() => setLimit(n)} style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)', border: `1px solid ${limit === n ? 'var(--accent-blue)' : 'var(--border-default)'}`, background: limit === n ? 'var(--accent-blue-glow)' : 'transparent', color: limit === n ? 'var(--accent-blue)' : 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
              {n} emails
            </button>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
          Limitado a 10 para controle de créditos da API.
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
          <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Buscando e analisando...</>
        ) : <><Mail size={14} /> Buscar e Analisar Gmail</>}
      </button>
    </div>
  )
}

// ─── History Item ──────────────────────────────────────────────────────────

function HistoryItem({ item, onSelect, onDelete, isActive }) {
  const isBatch = item.type === 'batch' || item.type === 'gmail'
  const isProductive = !isBatch && item.result?.data?.classification === 'PRODUTIVO'
  return (
    <div style={{ position: 'relative' }}
      onMouseEnter={e => e.currentTarget.querySelector('.del-btn').style.opacity = '1'}
      onMouseLeave={e => e.currentTarget.querySelector('.del-btn').style.opacity = '0'}>
      <button onClick={() => onSelect(item)} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', paddingRight: '28px', borderRadius: 'var(--radius-md)', background: isActive ? 'var(--bg-elevated)' : 'transparent', border: `1px solid ${isActive ? 'var(--border-default)' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.15s ease', display: 'flex', flexDirection: 'column', gap: '4px' }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)' }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: isBatch ? 'var(--accent-blue)' : isProductive ? 'var(--productive)' : 'var(--unproductive)' }} />
            <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {isBatch ? `${item.count} emails` : item.result?.data?.classification}
            </span>
          </div>
          {!isBatch && <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{Math.round((item.result?.data?.confidence || 0) * 100)}%</span>}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.label}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{item.timestamp}</div>
      </button>
      <button className="del-btn" onClick={e => { e.stopPropagation(); onDelete(item.id) }}
        style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', opacity: 0, transition: 'opacity 0.15s ease, color 0.15s ease', borderRadius: 'var(--radius-sm)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--high)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
        <Trash2 size={11} />
      </button>
    </div>
  )
}

// ─── Main App ──────────────────────────────────────────────────────────────

const TABS = [
  { key: 'text', label: 'Texto', icon: <FileText size={12} /> },
  { key: 'file', label: 'Arquivo', icon: <Upload size={12} /> },
  { key: 'batch', label: 'Múltiplos', icon: <Layers size={12} /> },
  { key: 'gmail', label: 'Gmail', icon: <Mail size={12} /> },
]

export default function MainApp({ user, onLogout }) {
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
        const resp = await fetch(`${API_BASE}/analyze/text`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
        if (!resp.ok) throw new Error((await resp.json()).detail || 'Erro')
        res = await resp.json()
        addSingleToHistory(res, text.slice(0, 40))
      } else {
        const fd = new FormData(); fd.append('file', files[0])
        const resp = await fetch(`${API_BASE}/analyze/file`, { method: 'POST', body: fd })
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
      const resp = await fetch(`${API_BASE}/analyze/batch`, { method: 'POST', body: fd })
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
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>by AutoU</div>
          </div>
        </div>

        {totalAnalyzed > 0 && (
          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              { label: 'Analisados', val: totalAnalyzed, color: 'var(--text-secondary)' },
              { label: 'Confiança avg', val: `${avgConf}%`, color: 'var(--accent-blue)' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: s.color, fontFamily: 'var(--font-mono)' }}>{s.val}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={12} color="var(--text-secondary)" />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>{user.name}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{user.role}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: 'var(--radius-sm)', background: 'none', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <LogOut size={12} /> Sair
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        {/* Sidebar */}
        <aside style={{ width: 220, flexShrink: 0, borderRight: '1px solid var(--border-subtle)', padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          <div style={{ padding: '4px 8px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={10} color="var(--text-muted)" />
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Histórico</span>
          </div>
          {history.length === 0
            ? <div style={{ textAlign: 'center', padding: '28px 10px', color: 'var(--text-faint)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>Nenhuma análise ainda</div>
            : history.map(item => <HistoryItem key={item.id} item={item} onSelect={handleHistorySelect} onDelete={handleDeleteHistory} isActive={item.id === activeHistoryId} />)
          }
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
                  <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Cole aqui o conteúdo do email para análise..." rows={7}
                    style={{ width: '100%', resize: 'vertical', minHeight: '140px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '14px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--font-body)', lineHeight: '1.65', outline: 'none', transition: 'border-color 0.2s ease' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-default)'} />
                  {text && <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{text.length} chars</div>}
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
                ) : <UploadZone onFiles={f => setFiles([f[0]])} isDragging={isDragging} setIsDragging={setIsDragging} />
              )}

              {/* Batch tab */}
              {tab === 'batch' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <UploadZone onFiles={f => setFiles(prev => [...prev, ...f].slice(0, 20))} isDragging={isDragging} setIsDragging={setIsDragging} multiple />
                  {files.length > 0 && (
                    <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{files.length} arquivo(s) selecionado(s)</span>
                        <button onClick={() => setFiles([])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><X size={11} /> Limpar</button>
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
              {tab === 'gmail' && <GmailTab onResults={handleGmailResults} />}

              {/* Actions */}
              {tab !== 'gmail' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {(text || files.length > 0 || result || batchResults) ? (
                    <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: 'var(--radius-sm)', background: 'none', border: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <RotateCcw size={11} /> Limpar
                    </button>
                  ) : <div />}
                  <button onClick={tab === 'batch' ? handleBatchSubmit : handleSubmitSingle} disabled={!canSubmit}
                    style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: canSubmit ? 'var(--accent-blue)' : 'var(--bg-elevated)', cursor: canSubmit ? 'pointer' : 'not-allowed', color: canSubmit ? 'white' : 'var(--text-muted)', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-body)', transition: 'all 0.2s ease', boxShadow: canSubmit ? '0 0 16px rgba(59,130,246,0.3)' : 'none' }}>
                    {loading
                      ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Analisando...</>
                      : <><Send size={13} /> {tab === 'batch' ? `Analisar ${files.length} arquivo(s)` : 'Analisar Email'}</>}
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
              <ResultCard data={result.data} filename={result.filename} onDelete={() => { setResult(null); setActiveHistoryId(null) }} />
            </div>
          )}

          {/* Batch / Gmail results */}
          {batchResults && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <BatchSummary results={batchResults} />
              {batchResults.map((r, i) => (
                r.success
                  ? <ResultCard key={i} data={r.data} filename={r.filename} subject={r.subject} sender={r.sender} collapsed
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
                  Todos os emails foram removidos.
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
              <p style={{ fontSize: '14px', marginBottom: '5px', color: 'var(--text-secondary)' }}>Pronto para analisar</p>
              <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Texto · Arquivo · Múltiplos arquivos · Gmail</p>
            </div>
          )}
        </main>

        {/* Right Panel */}
        <aside style={{ width: 200, flexShrink: 0, borderLeft: '1px solid var(--border-subtle)', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Info size={10} color="var(--text-muted)" />
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categorias</span>
            </div>
            {[{ type: 'PRODUTIVO', color: 'var(--productive)', desc: 'Requer ação ou resposta' }, { type: 'IMPRODUTIVO', color: 'var(--unproductive)', desc: 'Não requer ação imediata' }].map(c => (
              <div key={c.type} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{c.type}</span>
                </div>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', paddingLeft: '12px', lineHeight: '1.5' }}>{c.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Shield size={10} color="var(--text-muted)" />
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pipeline NLP</span>
            </div>
            {['Tokenização', 'Stopwords (PT+EN)', 'Stemming RSLP', 'Claude AI', 'Resposta gerada'].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '7px', marginBottom: '7px' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginTop: '2px', minWidth: 12 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{step}</span>
              </div>
            ))}
          </div>

          <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

          <div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Modos</div>
            {[['Texto livre', 'var(--text-muted)'], ['Arquivo único', 'var(--text-muted)'], ['Múltiplos (20x)', 'var(--accent-blue)'], ['Gmail (10x)', 'var(--productive)']].map(([t, c], i) => (
              <div key={i} style={{ fontSize: '10px', color: c, fontFamily: 'var(--font-mono)', marginBottom: '5px' }}>
                <span style={{ color: 'var(--text-faint)' }}>▸ </span>{t}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
