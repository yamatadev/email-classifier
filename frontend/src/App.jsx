import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import LoginPage from './components/LoginPage'
import MainApp from './components/MainApp'

function AuthRouter() {
  const { user, setUser, lang, setLang } = useApp()

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage onLogin={setUser} lang={lang} setLang={setLang} />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<MainApp onLogout={() => { localStorage.removeItem('mailsense_api_key'); setUser(null) }} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <AuthRouter />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
