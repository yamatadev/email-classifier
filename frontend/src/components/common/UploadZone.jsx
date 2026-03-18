import { useRef, useCallback } from 'react'
import { Upload, Layers } from 'lucide-react'
import { translations } from '../../i18n'
import styles from './UploadZone.module.css'

export default function UploadZone({ onFiles, isDragging, setIsDragging, multiple = false, lang }) {
  const inputRef = useRef()
  const ti = translations[lang || 'pt-BR'].input

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      const files = Array.from(e.dataTransfer.files)
      if (files.length) onFiles(files)
    },
    [onFiles, setIsDragging],
  )

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length) onFiles(files)
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  return (
    <div
      className={`${styles.zone} ${isDragging ? styles.dragging : ''}`}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={multiple ? ti.dragFiles : ti.dragFile}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.pdf"
        multiple={multiple}
        hidden
        onChange={handleChange}
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className={styles.iconWrapper} aria-hidden="true">
        {multiple ? (
          <Layers size={18} color="var(--text-secondary)" />
        ) : (
          <Upload size={18} color="var(--text-secondary)" />
        )}
      </div>
      <div className={styles.text}>
        {multiple ? ti.dragFiles : ti.dragFile}{' '}
        <span className={styles.link}>{ti.clickSelect}</span>
      </div>
      <div className={styles.hint}>
        {multiple ? ti.fileHintMultiple : ti.fileHintSingle}
      </div>
    </div>
  )
}
