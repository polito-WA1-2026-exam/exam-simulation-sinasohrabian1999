const router = require('express').Router()
const { isLoggedIn } = require('../utils/middleware')
const { getNetworkData } = require('../db')

router.get('/', isLoggedIn, (request, response) => {
  const { lines, stations, segments } = getNetworkData()

  const linesMap = {}
  for (const l of lines) {
    linesMap[l.id] = l
  }

  const segmentsWithLine = segments.map(s => ({
    id: s.id,
    line_id: s.line_id,
    line_name: linesMap[s.line_id].name,
    line_color: linesMap[s.line_id].color,
    station_a_id: s.station_a_id,
    station_a_name: s.station_a_name,
    station_b_id: s.station_b_id,
    station_b_name: s.station_b_name,
    position: s.position,
  }))

  response.json({ lines, stations, segments: segmentsWithLine })
})

module.exports = router
