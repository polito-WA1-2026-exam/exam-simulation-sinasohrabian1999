const router = require('express').Router()
const { isLoggedIn } = require('../utils/middleware')
const { db } = require('../db')

router.get('/', isLoggedIn, (request, response) => {
  const ranking = db.prepare(`
    SELECT u.username, MAX(g.score) as best_score, COUNT(g.id) as games_played
    FROM users u
    JOIN games g ON g.user_id = u.id
    GROUP BY u.id
    ORDER BY best_score DESC
  `).all()

  response.json(ranking)
})

module.exports = router
