const PORT           = process.env.PORT           || 3001
const SESSION_SECRET = process.env.SESSION_SECRET || 'lastrace-secret-key-2026'
const CLIENT_ORIGIN  = process.env.CLIENT_ORIGIN  || 'http://localhost:5173'

module.exports = { PORT, SESSION_SECRET, CLIENT_ORIGIN }
