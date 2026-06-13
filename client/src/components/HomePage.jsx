import { Link } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'

const HomePage = () => {
  const { user } = useUser();

  return (
    <div className="page">
      <div className="page-content">
        <div className="container">
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            {/* Hero */}
            <div style={{ marginBottom: 48, textAlign: 'center' }}>
              <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', color: 'var(--accent)', marginBottom: 12 }}>
                LAST RACE
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-dim)' }}>
                Navigate the underground. Beat the clock. Survive the journey.
              </p>
            </div>

            {/* Instructions */}
            <div className="card mb-2" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: 16 }}>How to Play</h2>
              <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li>
                  <strong>Setup</strong> — Study the metro network map. Learn the lines, stations, and interchanges.
                </li>
                <li>
                  <strong>Planning</strong> — You'll be assigned a start and destination station.
                  You have <strong style={{ color: 'var(--accent)' }}>90 seconds</strong> to
                  build your route by selecting segments in order — but the map won't show lines, only station names!
                </li>
                <li>
                  <strong>Execution</strong> — Your route is validated. For each leg, a random event occurs,
                  adding or removing coins from your starting balance of <strong style={{ color: 'var(--accent)' }}>20 coins</strong>.
                </li>
                <li>
                  <strong>Result</strong> — Your final score is your remaining coins. Reach the destination,
                  maximize your score, and climb the ranking!
                </li>
              </ol>
            </div>

            <div className="card mb-2" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>Route Rules</h3>
              <ul style={{ paddingLeft: 18, color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Your route must follow actual metro line connections.</li>
                <li>You can only switch lines at <strong style={{ color: 'var(--text)' }}>interchange stations</strong> — stations served by more than one line.</li>
                <li>An invalid or incomplete route means you lose all 20 coins.</li>
              </ul>
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              {user ? (
                <Link to="/game" className="btn btn-primary btn-lg">Start a Game</Link>
              ) : (
                <div>
                  <p className="text-dim mb-2" style={{ marginBottom: 12 }}>
                    Log in to access the network map and start playing.
                  </p>
                  <Link to="/login" className="btn btn-primary btn-lg">Login to Play</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
