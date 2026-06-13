import { useState, useEffect } from 'react'
import { API } from '../services/gameService'

const RankingPage = () => {
  const [ranking, setRanking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    API.getRanking()
      .then(setRanking)
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="page">
      <div className="page-content">
        <div className="container">
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.8rem', color: 'var(--accent)', marginBottom: 6 }}>RANKING</h1>
            <p className="text-dim" style={{ marginBottom: 28 }}>Best score per player, all time.</p>

            {error && <div className="alert alert-error">{error}</div>}

            {!ranking && !error && <p className="text-dim">Loading…</p>}

            {ranking && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="ranking-table">
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}>#</th>
                      <th>Player</th>
                      <th>Best Score</th>
                      <th>Games Played</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 24 }}>No games played yet.</td></tr>
                    )}
                    {ranking.map((row, i) => (
                      <tr key={row.username} className={`rank-${i + 1}`}>
                        <td className="rank-num">{i + 1}</td>
                        <td style={{ fontWeight: 500 }}>{row.username}</td>
                        <td className="rank-score">{row.best_score} <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>coins</span></td>
                        <td style={{ color: 'var(--text-dim)', fontSize: '0.88rem' }}>{row.games_played}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RankingPage
