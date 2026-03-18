import { createContext, useContext, useState, useMemo, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [lang, setLang] = useState('pt-BR')
  const [user, setUser] = useState(null)
  const [history, setHistory] = useState([])
  const [activeHistoryId, setActiveHistoryId] = useState(null)

  const apiKey = typeof window !== 'undefined'
    ? localStorage.getItem('mailsense_api_key') || ''
    : ''

  const addSingleToHistory = useCallback((result, label) => {
    const item = {
      id: crypto.randomUUID(),
      type: 'single',
      result,
      label: label?.slice(0, 40) || 'Email',
      timestamp: new Date().toLocaleTimeString(lang, {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
    setHistory(prev => [item, ...prev].slice(0, 30))
    setActiveHistoryId(item.id)
  }, [lang])

  const addBatchToHistory = useCallback((results, label, type = 'batch') => {
    const item = {
      id: crypto.randomUUID(),
      type,
      count: results.length,
      label: label?.slice(0, 40) || 'Batch',
      timestamp: new Date().toLocaleTimeString(lang, {
        hour: '2-digit',
        minute: '2-digit',
      }),
      batchResults: results,
    }
    setHistory(prev => [item, ...prev].slice(0, 30))
    setActiveHistoryId(item.id)
  }, [lang])

  const deleteHistoryItem = useCallback((id) => {
    setHistory(prev => prev.filter(h => h.id !== id))
    setActiveHistoryId(prev => (prev === id ? null : prev))
  }, [])

  const totalAnalyzed = useMemo(() =>
    history.reduce((acc, h) => acc + (h.type === 'single' ? 1 : (h.count || 0)), 0),
    [history]
  )

  const avgConfidence = useMemo(() => {
    const singles = history.filter(h => h.type === 'single')
    if (singles.length === 0) return 0
    const sum = singles.reduce((a, h) => a + (h.result?.data?.confidence || 0), 0)
    return Math.round((sum / singles.length) * 100)
  }, [history])

  const value = useMemo(() => ({
    lang,
    setLang,
    user,
    setUser,
    apiKey,
    history,
    setHistory,
    activeHistoryId,
    setActiveHistoryId,
    addSingleToHistory,
    addBatchToHistory,
    deleteHistoryItem,
    totalAnalyzed,
    avgConfidence,
  }), [
    lang, user, apiKey, history, activeHistoryId,
    addSingleToHistory, addBatchToHistory, deleteHistoryItem,
    totalAnalyzed, avgConfidence,
  ])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
