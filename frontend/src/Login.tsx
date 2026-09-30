import { useState } from 'react'
import './Login.css'

const API = 'http://127.0.0.1:5001/api'

type LoginProps = {
  onLogin: () => void
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('test@stocker.com')
  const [password, setPassword] = useState('test123456')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed')
      }

      localStorage.setItem('stocker_token', data.token)

      onLogin()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to login',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark">S</div>

          <div>
            <h1>Stocker</h1>
            <span>Market Intelligence</span>
          </div>
        </div>

        <div className="login-heading">
          <span className="section-label">WELCOME BACK</span>
          <h2>Sign in to Stocker</h2>
          <p>
            Access your portfolio, watchlist and market alerts.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <div className="demo-login">
          <strong>Demo account</strong>
          <span>test@stocker.com</span>
          <span>••••••••••</span>
        </div>
      </div>

      <div className="login-footer">
        Stocker • Stock market intelligence platform
      </div>
    </div>
  )
}

export default Login