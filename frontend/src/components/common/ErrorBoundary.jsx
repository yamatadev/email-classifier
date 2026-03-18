import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    if (typeof console !== 'undefined') {
      console.error('[ErrorBoundary]', error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleDismiss = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '32px',
            background: 'var(--bg-void, #0a0e1a)',
            color: 'var(--text-primary, #e2e8f0)',
            fontFamily: 'var(--font-body, system-ui, -apple-system, sans-serif)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              fontSize: 24,
            }}
            aria-hidden="true"
          >
            !
          </div>

          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 8,
              letterSpacing: '-0.01em',
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              fontSize: 14,
              color: 'var(--text-muted, #94a3b8)',
              marginBottom: 32,
              maxWidth: 380,
              lineHeight: 1.6,
            }}
          >
            An unexpected error occurred. You can try reloading the page to recover.
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={this.handleReload}
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(59, 130, 246, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)'
              }}
            >
              Reload page
            </button>

            <button
              onClick={this.handleDismiss}
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                border: '1px solid var(--border-default, #2d3748)',
                background: 'transparent',
                color: 'var(--text-secondary, #cbd5e1)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-blue, #3b82f6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default, #2d3748)'
              }}
            >
              Try again
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre
              style={{
                marginTop: 32,
                padding: 16,
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 8,
                border: '1px solid rgba(239, 68, 68, 0.2)',
                fontSize: 11,
                color: '#fca5a5',
                maxWidth: 600,
                overflow: 'auto',
                textAlign: 'left',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              {this.state.error.toString()}
              {this.state.error.stack && `\n\n${this.state.error.stack}`}
            </pre>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
