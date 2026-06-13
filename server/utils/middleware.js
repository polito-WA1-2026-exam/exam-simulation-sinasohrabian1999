const logger = require('./logger')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const isLoggedIn = (request, response, next) => {
  if (request.isAuthenticated()) {
    return next()
  }
  response.status(401).json({ error: 'Not authenticated.' })
}

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)
  response.status(500).json({ error: 'Internal server error.' })
}

module.exports = { requestLogger, isLoggedIn, unknownEndpoint, errorHandler }
