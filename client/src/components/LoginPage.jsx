import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'

const LoginPage = () => {
  const { user, login } = useUser()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) return <Navigate to="/game" replace />

  const handleSubmit = (event) => {
    event.preventDefault()
    login(username, password)
      .then(() => navigate('/game'))
      .catch(() => setError('Wrong username or password'))
  }

  return (
    <div className="page">
      <div className="page-content" style={{ display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: 380, margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.4rem', marginBottom: 8, color: 'var(--accent)' }}>SIGN IN</h1>
            <p className="text-dim mb-2" style={{ marginBottom: 28 }}>Enter the underground.</p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={({ target }) => setUsername(target.value)}
                  autoComplete="username"
                  autoFocus
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={({ target }) => setPassword(target.value)}
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }}>
                Login
              </button>
            </form>

            <p className="text-dim" style={{ marginTop: 20, fontSize: '0.85rem' }}>
              Test accounts: alice / password1 · bob / password2 · carol / password3
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
