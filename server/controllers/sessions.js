const router = require('express').Router()
const passport = require('passport')
const { isLoggedIn } = require('../utils/middleware')

router.post('/', (request, response, next) => {
  const { username, password } = request.body
  if (!username || !password) {
    return response.status(400).json({ error: 'Username and password required.' })
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      return response.status(401).json({ error: info?.message || 'Invalid credentials.' })
    }
    request.login(user, (err) => {
      if (err) {
        return next(err)
      }
      response.json({ id: user.id, username: user.username })
    })
  })(request, response, next)
})

router.delete('/current', isLoggedIn, (request, response) => {
  request.logout(() => {
    response.status(204).end()
  })
})

router.get('/current', (request, response) => {
  if (request.isAuthenticated()) {
    response.json({ id: request.user.id, username: request.user.username })
  } else {
    response.status(200).json(null)
  }
})

module.exports = router
