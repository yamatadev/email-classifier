import { useState } from 'react'
import {
  FileText, Upload, Send, Layers, Mail,
  X, RotateCcw, AlertCircle, BarChart3,
} from 'lucide-react'
import { translations } from '../i18n'
import { useApp } from '../context/AppContext'
import { useAnalysis } from '../hooks/useAnalysis'
import Header from './layout/Header'
import Sidebar from './layout/Sidebar'
import RightPanel from './layout/RightPanel'
import ResultCard from './analysis/ResultCard'
import BatchSummary from './analysis/BatchSummary'
import GmailTab from './analysis/GmailTab'
import UploadZone from './common/UploadZone'
import styles from './MainApp.module.css'

export default function MainApp({ onLogout }) {
  const { lang, setActiveHistoryId } = useApp()
  const t = translations[lang]
  const {
    loading, error, clearError,
    result, setResult,
    batchResults, setBatchResults, batchLabel,
    submitText, submitFile, submitBatch,
    handleGmailResults, handleReset,
  } = useAnalysis()

  const [tab, setTab] = useState('text')
  const [text, setText] = useState('')
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)

  const resetAll = () => {
    setText('')
    setFiles([])
    handleReset()
  }

  const handleTabChange = (key) => {
    setTab(key)
    resetAll()
  }

  const handleSubmit = () => {
    if (tab === 'text') submitText(text, lang)
    else if (tab === 'file' && files.length === 1) submitFile(files[0], lang)
    else if (tab === 'batch' && files.length > 0) {
      submitBatch(files, lang)
    }
  }

  const handleHistorySelect = (item) => {
    if (item.type === 'single') {
      setResult(item.result)
      setBatchResults(null)
    } else {
      setBatchResults(item.batchResults)
      setResult(null)
    }
  }

  const canSubmit = !loading && (
    (tab === 'text' && text.trim().length > 0) ||
    (tab === 'file' && files.length === 1) ||
    (tab === 'batch' && files.length > 0)
  )

  const TABS = [
    { key: 'text', label: t.tabs.text, icon: <FileText size={12} /> },
    { key: 'file', label: t.tabs.file, icon: <Upload size={12} /> },
    { key: 'batch', label: t.tabs.batch, icon: <Layers size={12} /> },
    { key: 'gmail', label: t.tabs.gmail, icon: <Mail size={12} /> },
  ]

  return (
    <div className={styles.page}>
      <Header onLogout={onLogout} />

      <div className={styles.body}>
        <Sidebar onSelectHistory={handleHistorySelect} />

        <main className={styles.main} role="main">
          {/* Input Card */}
          <div className={styles.inputCard}>
            {/* Tabs */}
            <div className={styles.tabBar} role="tablist">
              {TABS.map(tb => (
                <button
                  key={tb.key}
                  role="tab"
                  aria-selected={tab === tb.key}
                  className={`${styles.tab} ${tab === tb.key ? styles.tabActive : ''}`}
                  onClick={() => handleTabChange(tb.key)}
                >
                  {tb.icon}{tb.label}
                </button>
              ))}
            </div>

            <div className={styles.inputBody}>
              {/* Text tab */}
              {tab === 'text' && (
                <div>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder={t.input.textPlaceholder}
                    rows={7}
                    className={styles.textarea}
                    aria-label={t.input.textPlaceholder}
                  />
                  {text && (
                    <div className={styles.charCount}>
                      {text.length} {t.input.chars}
                    </div>
                  )}
                </div>
              )}

              {/* Single file tab */}
              {tab === 'file' && (
                files.length > 0 ? (
                  <div className={styles.filePreview}>
                    <div className={styles.fileInfo}>
                      <FileText size={15} color="var(--accent-blue)" />
                      <div>
                        <div className={styles.fileName}>{files[0].name}</div>
                        <div className={styles.fileSize}>{(files[0].size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <button onClick={() => setFiles([])} className={styles.clearFileBtn} aria-label="Remove file">
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <UploadZone onFiles={f => setFiles([f[0]])} isDragging={isDragging} setIsDragging={setIsDragging} lang={lang} />
                )
              )}

              {/* Batch tab */}
              {tab === 'batch' && (
                <div className={styles.batchSection}>
                  <UploadZone
                    onFiles={f => setFiles(prev => [...prev, ...f].slice(0, 20))}
                    isDragging={isDragging}
                    setIsDragging={setIsDragging}
                    multiple
                    lang={lang}
                  />
                  {files.length > 0 && (
                    <div className={styles.fileList}>
                      <div className={styles.fileListHeader}>
                        <span className={styles.fileListCount}>
                          {files.length} {t.input.filesSelected}
                        </span>
                        <button onClick={() => setFiles([])} className={styles.fileListClear}>
                          <X size={11} /> {t.input.clearAll}
                        </button>
                      </div>
                      <div className={styles.fileListScroll}>
                        {files.map((f, i) => (
                          <div key={i} className={styles.fileListItem}>
                            <div className={styles.fileListItemInfo}>
                              <FileText size={12} color="var(--text-muted)" />
                              <span>{f.name}</span>
                            </div>
                            <div className={styles.fileListItemActions}>
                              <span className={styles.fileListItemSize}>
                                {(f.size / 1024).toFixed(1)} KB
                              </span>
                              <button
                                onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                                className={styles.fileListItemRemove}
                                aria-label={`Remove ${f.name}`}
                              >
                                <X size={11} />
                              </button>
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
                <div className={styles.actions}>
                  {(text || files.length > 0 || result || batchResults) ? (
                    <button onClick={resetAll} className={styles.resetBtn}>
                      <RotateCcw size={11} /> {t.input.clear}
                    </button>
                  ) : <div />}
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className={`${styles.submitBtn} ${canSubmit ? styles.submitBtnActive : ''}`}
                  >
                    {loading ? (
                      <>
                        <span className={styles.spinner} />
                        {t.input.analyzing}
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        {tab === 'batch'
                          ? `${t.input.analyzeBatch} ${files.length} ${t.input.batchFiles || t.input.files}`
                          : t.input.analyze}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={`${styles.errorBar} fade-in`} role="alert">
              <AlertCircle size={14} color="var(--high)" />
              <span className={styles.errorText}>{error}</span>
              <button onClick={clearError} className={styles.errorClose} aria-label="Dismiss error">
                <X size={12} />
              </button>
            </div>
          )}

          {/* Single result */}
          {result && !batchResults && (
            <div className="fade-in">
              <ResultCard
                data={result.data}
                filename={result.filename}
                onDelete={() => { setResult(null); setActiveHistoryId(null) }}
                lang={lang}
              />
            </div>
          )}

          {/* Batch / Gmail results */}
          {batchResults && (
            <div className={`${styles.batchResults} fade-in`}>
              <BatchSummary results={batchResults} lang={lang} />
              {batchResults.map((r, i) => (
                r.success ? (
                  <ResultCard
                    key={i}
                    data={r.data}
                    filename={r.filename}
                    subject={r.subject}
                    sender={r.sender}
                    collapsed
                    lang={lang}
                    onDelete={() => setBatchResults(prev => prev.filter((_, j) => j !== i))}
                  />
                ) : (
                  <div key={i} className={styles.errorItem}>
                    <AlertCircle size={14} color="var(--high)" />
                    <div className={styles.errorItemBody}>
                      <div className={styles.errorItemName}>{r.filename || r.subject || 'File'}</div>
                      <div className={styles.errorItemMsg}>{r.error}</div>
                    </div>
                  </div>
                )
              ))}
              {batchResults.length === 0 && (
                <div className={styles.emptyBatch}>{t.batch.allRemoved}</div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!result && !batchResults && !loading && !error && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <BarChart3 size={22} color="var(--text-faint)" />
              </div>
              <p className={styles.emptyTitle}>{t.emptyState.title}</p>
              <p className={styles.emptySubtitle}>{t.emptyState.subtitle}</p>
            </div>
          )}
        </main>

        <RightPanel />
      </div>
    </div>
  )
}
