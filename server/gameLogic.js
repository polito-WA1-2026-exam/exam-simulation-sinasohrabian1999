const validateRoute = (route, startId, endId, networkData) => {
  if (!route || route.length < 2) {
    return { valid: false, reason: 'Route is too short.' }
  }
  if (route[0] !== startId) {
    return { valid: false, reason: 'Route does not start at the assigned station.' }
  }
  if (route[route.length - 1] !== endId) {
    return { valid: false, reason: 'Route does not end at the assigned destination.' }
  }

  const { segments, interchangeIds } = networkData

  const usedSegments = new Set()
  for (let i = 0; i < route.length - 1; i++) {
    const key = `${Math.min(route[i], route[i + 1])}-${Math.max(route[i], route[i + 1])}`
    if (usedSegments.has(key)) {
      return { valid: false, reason: 'Route uses the same segment more than once.' }
    }
    usedSegments.add(key)
  }

  const segmentLineMap = {}
  for (const seg of segments) {
    const key = `${Math.min(seg.station_a_id, seg.station_b_id)}-${Math.max(seg.station_a_id, seg.station_b_id)}`
    if (!segmentLineMap[key]) {
      segmentLineMap[key] = new Set()
    }
    segmentLineMap[key].add(seg.line_id)
  }

  let currentLines = null

  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i]
    const b = route[i + 1]
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`
    const linesForSeg = segmentLineMap[key]

    if (!linesForSeg || linesForSeg.size === 0) {
      return { valid: false, reason: `No direct connection between station ${a} and station ${b}.` }
    }

    if (currentLines === null) {
      currentLines = new Set(linesForSeg)
    } else {
      const intersection = new Set([...currentLines].filter(l => linesForSeg.has(l)))

      if (intersection.size > 0) {
        currentLines = intersection
      } else {
        if (!interchangeIds.has(a)) {
          return { valid: false, reason: `Line change attempted at non-interchange station (id ${a}).` }
        }
        currentLines = new Set(linesForSeg)
      }
    }
  }

  return { valid: true }
}

const bfsDistance = (startId, endId, adjacency) => {
  if (startId === endId) return 0
  const visited = new Set([startId])
  const queue = [[startId, 0]]
  while (queue.length > 0) {
    const [cur, dist] = queue.shift()
    const neighbors = adjacency[cur] || []
    for (const n of neighbors) {
      if (n === endId) return dist + 1
      if (!visited.has(n)) {
        visited.add(n)
        queue.push([n, dist + 1])
      }
    }
  }
  return Infinity
}

module.exports = { validateRoute, bfsDistance }
