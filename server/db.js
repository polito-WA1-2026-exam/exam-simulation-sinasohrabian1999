const { DatabaseSync } = require('node:sqlite')
const crypto = require('crypto')
const path = require('path')

const DB_PATH = path.join(__dirname, 'lastrace.db')

const initDB = () => {
  const db = new DatabaseSync(DB_PATH)
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS segments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      line_id INTEGER NOT NULL REFERENCES lines(id),
      station_a_id INTEGER NOT NULL REFERENCES stations(id),
      station_b_id INTEGER NOT NULL REFERENCES stations(id),
      position INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      effect INTEGER NOT NULL CHECK(effect BETWEEN -4 AND 4)
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      start_station_id INTEGER NOT NULL REFERENCES stations(id),
      end_station_id INTEGER NOT NULL REFERENCES stations(id),
      score INTEGER NOT NULL DEFAULT 0,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  const lineCount = db.prepare('SELECT COUNT(*) as c FROM lines').get().c
  if (lineCount > 0) return db

  const insertLine = db.prepare('INSERT INTO lines (name, color) VALUES (?, ?)')
  const lines = [
    ['Red Line',    '#e74c3c'],
    ['Blue Line',   '#2980b9'],
    ['Green Line',  '#27ae60'],
    ['Yellow Line', '#f39c12'],
    ['Purple Line', '#8e44ad'],
  ]
  const lineIds = {}
  for (const [name, color] of lines) {
    insertLine.run(name, color)
    lineIds[name] = db.prepare('SELECT last_insert_rowid() as id').get().id
  }

  const insertStation = db.prepare('INSERT INTO stations (name) VALUES (?)')
  const stationNames = [
    'Central',
    'Velaria Gate',
    'Falcon Crossing',
    'Lantern Square',
    'Dark Fountain',
    'Serene Borough',
    'Mosaic Avenue',
    'Ash Tower',
    'Echo Fields',
    'North Gate',
    'Arch of Light',
    'Hanging Gardens',
    'Old Market',
    'Tower Quarter',
  ]
  const stationIds = {}
  for (const name of stationNames) {
    insertStation.run(name)
    stationIds[name] = db.prepare('SELECT last_insert_rowid() as id').get().id
  }

  const insertSegment = db.prepare(
    'INSERT INTO segments (line_id, station_a_id, station_b_id, position) VALUES (?, ?, ?, ?)'
  )
  const lineSegments = {
    'Red Line': [
      ['Old Market', 'Central'],
      ['Central', 'Lantern Square'],
      ['Lantern Square', 'Tower Quarter'],
    ],
    'Blue Line': [
      ['North Gate', 'Velaria Gate'],
      ['Velaria Gate', 'Central'],
      ['Central', 'Arch of Light'],
    ],
    'Green Line': [
      ['Velaria Gate', 'Falcon Crossing'],
      ['Falcon Crossing', 'Dark Fountain'],
      ['Dark Fountain', 'Ash Tower'],
      ['Ash Tower', 'Echo Fields'],
    ],
    'Yellow Line': [
      ['Lantern Square', 'Dark Fountain'],
      ['Dark Fountain', 'Serene Borough'],
      ['Serene Borough', 'Mosaic Avenue'],
    ],
    'Purple Line': [
      ['Tower Quarter', 'Echo Fields'],
      ['Echo Fields', 'Mosaic Avenue'],
      ['Mosaic Avenue', 'Hanging Gardens'],
    ],
  }
  for (const [lineName, segs] of Object.entries(lineSegments)) {
    const lid = lineIds[lineName]
    segs.forEach(([a, b], i) => {
      insertSegment.run(lid, stationIds[a], stationIds[b], i)
    })
  }

  const insertEvent = db.prepare('INSERT INTO events (description, effect) VALUES (?, ?)')
  const events = [
    ['Quiet journey — no surprises.', 0],
    ['Wrong platform! You scramble to catch the train.', -2],
    ['A kind passenger gives you their seat.', 1],
    ['Signal delay — stuck between stations.', -1],
    ['You find a lucky coin on the floor!', 2],
    ['Pickpocket! Watch your pockets.', -3],
    ['Express service today — you arrive early.', 3],
    ['Overcrowded carriage — exhausting ride.', -1],
    ['Cheerful busker lifts your spirits.', 1],
    ['Emergency stop — minor inconvenience.', -2],
    ['Free newspaper — you pass the time well.', 0],
    ['Station upgrade bonus — free token!', 4],
    ['Missed your stop — backtrack needed.', -4],
    ['Friendly conductor upgrades your ticket.', 2],
  ]
  for (const [desc, effect] of events) {
    insertEvent.run(desc, effect)
  }

  const createUser = (username, password) => {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.scryptSync(password, salt, 64).toString('hex')
    db.prepare('INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)').run(username, hash, salt)
    return db.prepare('SELECT last_insert_rowid() as id').get().id
  }
  const uid1 = createUser('alice', 'password1')
  const uid2 = createUser('bob', 'password2')
  createUser('carol', 'password3')

  const insertGame = db.prepare(
    'INSERT INTO games (user_id, start_station_id, end_station_id, score, completed_at) VALUES (?, ?, ?, ?, ?)'
  )
  insertGame.run(uid1, stationIds['Central'], stationIds['Echo Fields'], 18, '2026-05-20 10:00:00')
  insertGame.run(uid1, stationIds['Velaria Gate'], stationIds['Mosaic Avenue'], 22, '2026-05-21 11:00:00')
  insertGame.run(uid1, stationIds['Dark Fountain'], stationIds['Tower Quarter'], 15, '2026-05-22 09:00:00')
  insertGame.run(uid2, stationIds['Central'], stationIds['North Gate'], 25, '2026-05-19 14:00:00')
  insertGame.run(uid2, stationIds['Lantern Square'], stationIds['Dark Fountain'], 10, '2026-05-23 16:00:00')

  return db
}

const db = initDB()

const getNetworkData = () => {
  const lines = db.prepare('SELECT * FROM lines').all()
  const stations = db.prepare('SELECT * FROM stations').all()
  const segments = db.prepare(`
    SELECT s.id, s.line_id, s.position,
           sa.id as station_a_id, sa.name as station_a_name,
           sb.id as station_b_id, sb.name as station_b_name
    FROM segments s
    JOIN stations sa ON sa.id = s.station_a_id
    JOIN stations sb ON sb.id = s.station_b_id
  `).all()

  const stationLineCount = {}
  for (const seg of segments) {
    stationLineCount[seg.station_a_id] = stationLineCount[seg.station_a_id] || new Set()
    stationLineCount[seg.station_b_id] = stationLineCount[seg.station_b_id] || new Set()
    stationLineCount[seg.station_a_id].add(seg.line_id)
    stationLineCount[seg.station_b_id].add(seg.line_id)
  }
  const interchangeIds = new Set(
    Object.entries(stationLineCount)
      .filter(([, lines]) => lines.size > 1)
      .map(([id]) => Number(id))
  )

  const adjacency = {}
  for (const seg of segments) {
    const { station_a_id: a, station_b_id: b } = seg
    if (!adjacency[a]) adjacency[a] = []
    if (!adjacency[b]) adjacency[b] = []
    adjacency[a].push(b)
    adjacency[b].push(a)
  }

  return { lines, stations, segments, interchangeIds, adjacency }
}

module.exports = { db, getNetworkData, DB_PATH }
