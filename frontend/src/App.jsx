import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('connecting')

  const fetchMessages = async (retryCount = 0) => {
    if (retryCount === 0) {
      setLoading(true)
      setError(null)
    }
    setStatus('connecting')
    try {
      const response = await fetch('/api/public/messages')
      if (!response.ok) {
        throw new Error(`HTTP Error status: ${response.status}`)
      }
      const data = await response.json()
      setMessages(data)
      setStatus('connected')
      setLoading(false)
    } catch (err) {
      console.error(`Error fetching backend messages (attempt ${retryCount + 1}):`, err)
      if (retryCount < 5) {
        setTimeout(() => {
          fetchMessages(retryCount + 1)
        }, 2000)
      } else {
        setError(err.message || 'Connection failed to Nginx /api')
        setStatus('disconnected')
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  return (
    <div className="dashboard">
      {/* Top Navbar */}
      <header className="dashboard-header">
        <div className="brand">
          <div className="brand-logo">Z</div>
          <span className="brand-name">Zariya Finance</span>
        </div>
        <div className={`connection-pill ${status}`}>
          <span className="pulse-dot"></span>
          <span>
            {status === 'connected' && 'PostgreSQL Connected'}
            {status === 'connecting' && 'Testing Connection...'}
            {status === 'disconnected' && 'Connection Offline'}
          </span>
        </div>
      </header>

      {/* Main Grid content */}
      <main className="dashboard-grid">
        {/* Left main card */}
        <section className="glass-card accent-card">
          <div className="card-title-area">
            <div>
              <div className="card-label">Database Monitor</div>
              <h1 className="card-title">Backend Connectivity</h1>
            </div>
          </div>
          <p className="card-desc">
            This module verifies successful communication across our full stack: the React frontend, the Spring Boot JPA backend, and the PostgreSQL database.
          </p>

          {/* Connection message or loader */}
          {loading ? (
            <div className="skeleton-box"></div>
          ) : error ? (
            <div className="error-container">
              <div className="error-title">
                ⚠️ Connection Failure
              </div>
              <p>Could not connect to the backend server running on port 5174. Please verify the following:</p>
              <ul>
                <li>The backend server is running: <code>./gradlew bootRun</code></li>
                <li>The server is running on the correct port (5174)</li>
                <li>PostgreSQL is running and accepting connections</li>
              </ul>
              <div className="error-message">{error}</div>
            </div>
          ) : (
            <div className="message-container">
              <div className="message-icon">📁</div>
              <div>
                <div className="card-label" style={{ marginBottom: '2px' }}>Welcome Message from DB</div>
                <div className="message-content">
                  {messages.length > 0 ? messages[0].content : 'No messages found in the database.'}
                </div>
              </div>
            </div>
          )}

          <div className="actions-area">
            <button
              type="button"
              className="primary-btn"
              onClick={fetchMessages}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" />
                  </svg>
                  Syncing...
                </>
              ) : (
                'Refresh Connection'
              )}
            </button>
            {status === 'connected' && (
              <>
                <a
                  href="http://localhost:5174/swagger-ui.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="secondary-btn"
                  style={{ textDecoration: 'none' }}
                >
                  📖 Explore Swagger API
                </a>
                <a
                  href="http://localhost:8080"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="secondary-btn"
                  style={{ textDecoration: 'none' }}
                >
                  🗄️ Database Admin
                </a>
              </>
            )}
          </div>
        </section>

        {/* Right sidebar details */}
        <aside className="details-sidebar">
          <div className="glass-card">
            <div>
              <div className="card-label">System Specs</div>
              <h2 className="card-title" style={{ fontSize: '20px' }}>Connection Details</h2>
            </div>

            <div className="details-list">
              <div className="detail-row">
                <span className="detail-label">Backend Host</span>
                <span className="detail-value">localhost</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Backend Port</span>
                <span className="detail-value">
                  <span className="detail-badge">5174</span>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Database Type</span>
                <span className="detail-value">PostgreSQL</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">DB Host (Local/Docker)</span>
                <span className="detail-value">localhost / db</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">DB Port (Local/Docker)</span>
                <span className="detail-value">5433 / 5432</span>
              </div>
              
              {/* Adminer copy-paste credentials panel */}
              <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                <span className="detail-label" style={{ fontWeight: '600', color: 'var(--text-h)' }}>Adminer Login Credentials</span>
                <div style={{ width: '100%', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text)' }}>System:</span>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: '600' }}>PostgreSQL</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text)' }}>Server:</span>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: '600' }}>db</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text)' }}>Username:</span>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: '600' }}>finance_user</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text)' }}>Password:</span>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: '600' }}>finance_secure_password</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text)' }}>Database:</span>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: '600' }}>finance</span>
                  </div>
                </div>
              </div>

              <div className="detail-row">
                <span className="detail-label">JPA/Hibernate Mode</span>
                <span className="detail-value">update</span>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
