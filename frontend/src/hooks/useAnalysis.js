import { useState, useCallback } from 'react'
import { translations } from '../i18n'
import { useApp } from '../context/AppContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useAnalysis() {
  const { addSingleToHistory, addBatchToHistory } = useApp()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [batchResults, setBatchResults] = useState(null)
  const [batchLabel, setBatchLabel] = useState('')

  const clearError = useCallback(() => setError(null), [])

  const getAuthHeaders = useCallback(() => {
    const apiKey = localStorage.getItem('mailsense_api_key') || ''
    return { Authorization: `Bearer ${apiKey}` }
  }, [])

  const submitText = useCallback(async (text, lang) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setBatchResults(null)
    try {
      const resp = await fetch(`${API_BASE}/analyze/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ text, lang }),
      })
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}))
        throw new Error(body.detail || 'Error analyzing text')
      }
      const res = await resp.json()
      setResult(res)
      addSingleToHistory(res, text.slice(0, 40))
      return res
    } catch (e) {
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [addSingleToHistory, getAuthHeaders])

  const submitFile = useCallback(async (file, lang) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setBatchResults(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const resp = await fetch(`${API_BASE}/analyze/file?lang=${lang}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: fd,
      })
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}))
        throw new Error(body.detail || 'Error analyzing file')
      }
      const res = await resp.json()
      setResult(res)
      addSingleToHistory(res, file.name)
      return res
    } catch (e) {
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [addSingleToHistory, getAuthHeaders])

  const submitBatch = useCallback(async (files, lang) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setBatchResults(null)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      const resp = await fetch(`${API_BASE}/analyze/batch?lang=${lang}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: fd,
      })
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}))
        throw new Error(body.detail || 'Error analyzing batch')
      }
      const data = await resp.json()
      setBatchResults(data.results)
      const t = translations[lang] || translations['pt-BR']
      const label = `${files.length} ${t.input.batchFiles}`
      setBatchLabel(label)
      addBatchToHistory(data.results, label)
      return data.results
    } catch (e) {
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [addBatchToHistory, getAuthHeaders])

  const handleGmailResults = useCallback((results, label) => {
    setBatchResults(results)
    setBatchLabel(label)
    setResult(null)
    addBatchToHistory(results, label, 'gmail')
  }, [addBatchToHistory])

  const handleReset = useCallback(() => {
    setResult(null)
    setBatchResults(null)
    setBatchLabel('')
    setError(null)
  }, [])

  return {
    loading,
    error,
    clearError,
    result,
    setResult,
    batchResults,
    setBatchResults,
    batchLabel,
    submitText,
    submitFile,
    submitBatch,
    handleGmailResults,
    handleReset,
  }
}
