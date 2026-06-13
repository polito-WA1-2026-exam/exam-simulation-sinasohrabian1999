import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { API } from '../services/gameService'
import NetworkMap from './NetworkMap'

const PLANNING_SECONDS = 90

const SetupPhase = ({ network, onReady }) => {
  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', marginBottom: 6 }}>Study the Network</h2>
      <p className="text-dim" style={{ marginBottom: 20 }}>
        Memorize the lines, stations, and interchanges. When you're ready, start the game — the map will no longer show lines!
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        {network.lines.map(l => (
          <span key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem' }}>
            <span style={{ width: 18, height: 4, borderRadius: 2, background: l.color, display: 'inline-block' }} />
            {l.name}
          </span>
        ))}
      </div>

      <NetworkMap network={network} showLines={true} />

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button className="btn btn-primary btn-lg" onClick={onReady}>
          I'm Ready — Start Planning
        </button>
      </div>
    </div>
  )
}

const PlanningPhase = ({ network, startStation, endStation, onSubmit }) => {
  const [timeLeft, setTimeLeft] = useState(PLANNING_SECONDS)
  const [route, setRoute] = useState([startStation.id])
  const timerRef = useRef(null)
  const submitted = useRef(false)

  const doSubmit = (currentRoute) => {
    if (submitted.current) return
    submitted.current = true
    clearInterval(timerRef.current)
    onSubmit(currentRoute)
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const routeRef = useRef(route)
  routeRef.current = route
  useEffect(() => {
    if (timeLeft === 0) {
      doSubmit(routeRef.current)
    }
  }, [timeLeft, doSubmit])

  const adjacencyById = {}
  for (const seg of network.segments) {
    const a = seg.station_a_id
    const b = seg.station_b_id
    if (!adjacencyById[a]) adjacencyById[a] = []
    if (!adjacencyById[b]) adjacencyById[b] = []
    adjacencyById[a].push(b)
    adjacencyById[b].push(a)
  }

  const lastId = route[route.length - 1]
  const reachableNext = new Set(adjacencyById[lastId] || [])

  const seenSegKeys = new Set()
  const uniqueSegments = []
  for (const seg of network.segments) {
    const key = `${Math.min(seg.station_a_id, seg.station_b_id)}-${Math.max(seg.station_a_id, seg.station_b_id)}`
    if (!seenSegKeys.has(key)) {
      seenSegKeys.add(key)
      uniqueSegments.push({ ...seg, key })
    }
  }

  const routeSegKeys = new Set()
  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i]
    const b = route[i+1]
    routeSegKeys.add(`${Math.min(a,b)}-${Math.max(a,b)}`)
  }

  const handleSegmentClick = (seg) => {
    const { station_a_id: a, station_b_id: b } = seg
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`
    if (routeSegKeys.has(key)) return
    let nextId = null
    if (a === lastId && reachableNext.has(b)) nextId = b
    else if (b === lastId && reachableNext.has(a)) nextId = a
    if (nextId === null) return
    setRoute(r => [...r, nextId])
  }

  const handleUndo = () => {
    setRoute(r => r.length > 1 ? r.slice(0, -1) : r)
  }

  const stationById = {}
  for (const s of network.stations) stationById[s.id] = s

  const urgent = timeLeft <= 20

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Plan Your Route</h2>
          <p className="text-dim" style={{ fontSize: '0.9rem' }}>
            From <strong style={{ color: 'var(--text)' }}>{startStation.name}</strong> to{' '}
            <strong style={{ color: 'var(--accent)' }}>{endStation.name}</strong>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className={`timer ${urgent ? 'urgent' : ''}`}>{timeLeft}s</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>remaining</div>
        </div>
      </div>

      <NetworkMap network={network} showLines={false} highlightRoute={route} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, marginTop: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)' }}>
              Your Route ({route.length - 1} segment{route.length !== 2 ? 's' : ''})
            </span>
            <button className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '4px 10px' }} onClick={handleUndo} disabled={route.length <= 1}>
              ← Undo
            </button>
          </div>
          <div className="route-display">
            {route.map((id, i) => (
              <span key={i}>
                {i > 0 && <span className="route-arrow">→</span>}
                <span className={`route-station ${id === endStation.id ? 'text-accent' : ''}`}
                  style={{ borderColor: id === startStation.id ? 'var(--accent)' : id === endStation.id ? 'var(--accent)' : undefined }}>
                  {stationById[id]?.name || id}
                </span>
              </span>
            ))}
          </div>
          {route[route.length - 1] === endStation.id && (
            <div className="alert alert-success" style={{ marginTop: 12 }}>
              Route complete! Submit when ready.
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', marginBottom: 8 }}>
            Segments
          </div>
          <div className="segment-list">
            {uniqueSegments.map(seg => {
              const inRoute = routeSegKeys.has(seg.key)
              const canAdd = (seg.station_a_id === lastId && reachableNext.has(seg.station_b_id)) ||
                             (seg.station_b_id === lastId && reachableNext.has(seg.station_a_id))
              return (
                <div
                  key={seg.key}
                  className={`segment-item ${inRoute ? 'in-route' : ''} ${canAdd && !inRoute ? 'selected' : ''}`}
                  onClick={() => handleSegmentClick(seg)}
                  style={{ opacity: !canAdd && !inRoute ? 0.4 : 1 }}
                >
                  <span className="seg-stations">
                    {seg.station_a_name} — {seg.station_b_name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
        <button
          className="btn btn-primary"
          onClick={() => doSubmit(route)}
          disabled={route.length < 2}
        >
          Submit Route
        </button>
        <span className="text-dim" style={{ fontSize: '0.85rem', alignSelf: 'center' }}>
          {route[route.length - 1] !== endStation.id
            ? `${route.length - 1} segment${route.length !== 2 ? 's' : ''} planned — destination not yet reached`
            : `✓ Route reaches destination`}
        </span>
      </div>
    </div>
  )
}

const ExecutionPhase = ({ result, network, onContinue }) => {
  const [revealedCount, setRevealedCount] = useState(0)

  const stationById = {}
  for (const s of network.stations) stationById[s.id] = s

  useEffect(() => {
    if (!result.valid || revealedCount >= result.steps.length) return
    const timer = setTimeout(() => setRevealedCount(c => c + 1), 1200)
    return () => clearTimeout(timer)
  }, [revealedCount, result])

  if (!result.valid) {
    return (
      <div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: 6, color: 'var(--danger)' }}>Invalid Route</h2>
        <p className="text-dim" style={{ marginBottom: 16 }}>
          {result.reason || 'Your route was invalid or incomplete.'}
        </p>
        <div className="alert alert-error">You lost all 20 coins. Final score: <strong>0</strong>.</div>
        <button className="btn btn-primary mt-3" onClick={onContinue}>See Result</button>
      </div>
    )
  }

  const allRevealed = revealedCount >= result.steps.length

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', marginBottom: 6 }}>Journey</h2>
      <p className="text-dim" style={{ marginBottom: 20 }}>
        {result.steps.length} segment{result.steps.length !== 1 ? 's' : ''} — watching your route unfold…
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {result.steps.slice(0, revealedCount).map((step, i) => {
          const effect = step.event.effect
          return (
            <div key={i} className="step-card">
              <div>
                <div className="step-journey" style={{ marginBottom: 2 }}>
                  {stationById[step.fromStationId]?.name} → {stationById[step.toStationId]?.name}
                </div>
                <div className="step-event">{step.event.description}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className={`step-effect ${effect > 0 ? 'positive' : effect < 0 ? 'negative' : 'zero'}`}>
                  {effect > 0 ? `+${effect}` : effect}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  → {step.coinsAfter} coins
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {allRevealed && (
        <button className="btn btn-primary btn-lg" onClick={onContinue}>
          See Final Score
        </button>
      )}
    </div>
  )
}

const ResultPhase = ({ result, startStation, endStation, onNewGame }) => {
  const score = result.score
  return (
    <div style={{ textAlign: 'center', paddingTop: 20 }}>
      <h2 style={{ fontSize: '1.3rem', color: 'var(--text-dim)', marginBottom: 8, fontFamily: 'var(--font-body)', fontWeight: 400 }}>
        {startStation.name} → {endStation.name}
      </h2>
      <div style={{ fontSize: 'clamp(4rem, 12vw, 7rem)', fontFamily: 'var(--font-display)', color: score > 0 ? 'var(--accent)' : 'var(--danger)', lineHeight: 1, marginBottom: 8 }}>
        {score}
      </div>
      <div style={{ fontSize: '1rem', color: 'var(--text-dim)', marginBottom: 32 }}>
        {score === 0 ? 'coins — better luck next time' : score === 1 ? 'coin — barely made it!' : 'coins'}
      </div>

      {!result.valid && (
        <div className="alert alert-error" style={{ marginBottom: 20, display: 'inline-block' }}>
          Invalid route — all coins lost.
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-primary btn-lg" onClick={onNewGame}>Play Again</button>
        <Link to="/ranking" className="btn btn-outline btn-lg">View Ranking</Link>
      </div>
    </div>
  )
}

const GamePage = () => {
  const [phase, setPhase] = useState('loading')
  const [network, setNetwork] = useState(null)
  const [startStation, setStartStation] = useState(null)
  const [endStation, setEndStation] = useState(null)
  const [gameResult, setGameResult] = useState(null)
  const [error, setError] = useState('')

  const initGame = async () => {
    setPhase('loading')
    setError('')
    try {
      const [net, gameData] = await Promise.all([API.getNetwork(), API.startGame()])
      setNetwork(net)
      setStartStation(gameData.startStation)
      setEndStation(gameData.endStation)
      setPhase('setup')
    } catch (err) {
      setError(err.message)
      setPhase('error')
    }
  }

  useEffect(() => {
    initGame()
  }, [])

  const handleSubmitRoute = async (route) => {
    setPhase('submitting')
    try {
      const result = await API.submitRoute(route, startStation.id, endStation.id)
      setGameResult(result)
      setPhase('execution')
    } catch (err) {
      setError(err.message)
      setPhase('error')
    }
  }

  return (
    <div className="page">
      <div className="page-content">
        <div className="container">
          {phase !== 'loading' && phase !== 'error' && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
              {['setup', 'planning', 'execution', 'result'].map((p, i) => {
                const phases = ['setup', 'planning', 'execution', 'result', 'submitting']
                const currentIdx = phases.indexOf(phase)
                const myIdx = i
                const active = p === phase || (phase === 'submitting' && p === 'planning')
                const done = myIdx < (currentIdx === 4 ? 2 : currentIdx)
                return (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {i > 0 && <div style={{ width: 20, height: 1, background: 'var(--border)' }} />}
                    <span style={{
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: active ? 'var(--accent)' : done ? 'var(--success)' : 'var(--text-dim)',
                      fontWeight: active ? 700 : 400,
                    }}>
                      {done ? '✓ ' : ''}{p}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {phase === 'loading' && <p className="text-dim">Loading game…</p>}
          {phase === 'error' && (
            <div>
              <div className="alert alert-error">{error}</div>
              <button className="btn btn-outline mt-2" onClick={initGame}>Try Again</button>
            </div>
          )}
          {phase === 'submitting' && <p className="text-dim">Validating your route…</p>}

          {phase === 'setup' && network && (
            <SetupPhase network={network} onReady={() => setPhase('planning')} />
          )}
          {phase === 'planning' && network && startStation && endStation && (
            <PlanningPhase
              network={network}
              startStation={startStation}
              endStation={endStation}
              onSubmit={handleSubmitRoute}
            />
          )}
          {phase === 'execution' && gameResult && network && (
            <ExecutionPhase
              result={gameResult}
              network={network}
              onContinue={() => setPhase('result')}
            />
          )}
          {phase === 'result' && gameResult && startStation && endStation && (
            <ResultPhase
              result={gameResult}
              startStation={startStation}
              endStation={endStation}
              onNewGame={initGame}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default GamePage
