import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { translations } from '../../i18n'
import styles from './CopyButton.module.css'

/**
 * Copies text to clipboard with fallback for older browsers
 * or insecure contexts where navigator.clipboard is unavailable.
 */
async function copyToClipboard(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // Fall through to textarea fallback
    }
  }

  // Textarea fallback for insecure contexts or older browsers
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    document.execCommand('copy')
  } finally {
    document.body.removeChild(textarea)
  }
}

export default function CopyButton({ text, lang }) {
  const [copied, setCopied] = useState(false)
  const tr = translations[lang || 'pt-BR'].results

  const handleCopy = async () => {
    try {
      await copyToClipboard(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Silently fail — nothing to show the user
    }
  }

  return (
    <button
      className={`${styles.button} ${copied ? styles.copied : ''}`}
      onClick={handleCopy}
      type="button"
      aria-label={copied ? tr.copied : tr.copy}
    >
      {copied ? (
        <>
          <Check size={11} aria-hidden="true" /> {tr.copied}
        </>
      ) : (
        <>
          <Copy size={11} aria-hidden="true" /> {tr.copy}
        </>
      )}
    </button>
  )
}
