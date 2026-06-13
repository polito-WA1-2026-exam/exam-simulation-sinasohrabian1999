const router = require('express').Router()
const { isLoggedIn } = require('../utils/middleware')
const { db, getNetworkData } = require('../db')
const { validateRoute, bfsDistance } = require('../gameLogic')

const STARTING_COINS = 20

router.post('/', isLoggedIn, (request, response) => {
  const { stations, adjacency } = getNetworkData()

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)
  const shuffledStations = shuffle(stations)

  let startStation = null
  let endStation = null

  outer:
  for (const s of shuffledStations) {
    for (const e of shuffle(stations)) {
      if (s.id === e.id) continue
      const dist = bfsDistance(s.id, e.id, adjacency)
      if (dist >= 3) {
        startStation = s
        endStation = e
        break outer
      }
    }
  }

  if (!startStation || !endStation) {
    return response.status(500).json({ error: 'Could not find a valid start/end pair.' })
  }

  response.json({
    startStation: { id: startStation.id, name: startStation.name },
    endStation: { id: endStation.id, name: endStation.name },
  })
})

router.post('/submit', isLoggedIn, (request, response) => {
  const { route, startStationId, endStationId } = request.body

  if (!Array.isArray(route) || typeof startStationId !== 'number' || typeof endStationId !== 'number') {
    return response.status(400).json({ error: 'Invalid request body.' })
  }

  const { segments, interchangeIds } = getNetworkData()
  const validation = validateRoute(route, startStationId, endStationId, { segments, interchangeIds })
  const events = db.prepare('SELECT * FROM events').all()

  if (!validation.valid) {
    db.prepare(
      'INSERT INTO games (user_id, start_station_id, end_station_id, score) VALUES (?, ?, ?, ?)'
    ).run(request.user.id, startStationId, endStationId, 0)

    return response.json({ valid: false, reason: validation.reason, score: 0, steps: [] })
  }

  let coins = STARTING_COINS
  const steps = []
  for (let i = 0; i < route.length - 1; i++) {
    const event = events[Math.floor(Math.random() * events.length)]
    coins += event.effect
    steps.push({
      fromStationId: route[i],
      toStationId: route[i + 1],
      event: { description: event.description, effect: event.effect },
      coinsAfter: coins,
    })
  }

  const finalScore = Math.max(0, coins)

  db.prepare(
    'INSERT INTO games (user_id, start_station_id, end_station_id, score) VALUES (?, ?, ?, ?)'
  ).run(request.user.id, startStationId, endStationId, finalScore)

  response.json({ valid: true, score: finalScore, steps })
})

module.exports = router
