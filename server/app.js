const express = require('express')
require('dotenv').config();
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const cors = require('cors')
const crypto = require('crypto')
const MemoryStore = require('memorystore')(session)

const { db } = require('./db')
const { SESSION_SECRET, CLIENT_ORIGIN } = require('./utils/config')
const { requestLogger, unknownEndpoint, errorHandler } = require('./utils/middleware')
const sessionsRouter = require('./controllers/sessions')
const networkRouter = require('./controllers/network')
const gamesRouter = require('./controllers/games')
const rankingRouter = require('./controllers/ranking')

const app = express()

app.use(express.json())
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,
}))

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({ checkPeriod: 86400000 }),
  cookie: { httpOnly: true, sameSite: 'lax' },
}))

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy((username, password, done) => {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!user) {
    return done(null, false, { message: 'Invalid credentials.' })
  }
  const hash = crypto.scryptSync(password, user.salt, 64).toString('hex')
  if (hash !== user.password_hash) {
    return done(null, false, { message: 'Invalid credentials.' })
  }
  return done(null, { id: user.id, username: user.username })
}))

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id)
  if (!user) {
    return done(null, false)
  }
  done(null, user)
})

app.use(requestLogger)

app.use('/api/sessions', sessionsRouter)
app.use('/api/network', networkRouter)
app.use('/api/games', gamesRouter)
app.use('/api/ranking', rankingRouter)

app.use(unknownEndpoint)
app.use(errorHandler)

module.exports = app
