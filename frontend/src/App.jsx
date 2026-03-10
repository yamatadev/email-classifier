import { useState } from 'react'
import LoginPage from './components/LoginPage'
import MainApp from './components/MainApp'

export default function App() {
  const [user, setUser] = useState(null)
  const [lang, setLang] = useState('pt-BR')

  if (!user) return <LoginPage onLogin={setUser} lang={lang} setLang={setLang} />
  return <MainApp user={user} onLogout={() => setUser(null)} lang={lang} setLang={setLang} />
}
