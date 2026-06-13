import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'

const Navbar = () => {
  const { user, logout } = useUser()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav>
      <div className="container">
        <Link to="/" className="nav-logo">LAST RACE</Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/ranking" className="btn btn-ghost">Ranking</Link>
              <Link to="/game" className="btn btn-outline">Play</Link>
              <span className="text-dim" style={{ fontSize: '0.85rem', padding: '0 4px' }}>
                {user.username}
              </span>
              <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">Login</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
