import axios from 'axios'

const baseUrl = 'http://localhost:3001/api'

axios.defaults.withCredentials = true

const login = (username, password) => {
  const request = axios.post(`${baseUrl}/sessions`, { username, password })
  return request.then(response => response.data)
}

const logout = () => {
  const request = axios.delete(`${baseUrl}/sessions/current`)
  return request.then(response => response.data)
}

const getSession = () => {
  const request = axios.get(`${baseUrl}/sessions/current`)
  return request.then(response => response.data)
}

const getNetwork = () => {
  const request = axios.get(`${baseUrl}/network`)
  return request.then(response => response.data)
}

const startGame = () => {
  const request = axios.post(`${baseUrl}/games`)
  return request.then(response => response.data)
}

const submitRoute = (route, startStationId, endStationId) => {
  const request = axios.post(`${baseUrl}/games/submit`, { route, startStationId, endStationId })
  return request.then(response => response.data)
}

const getRanking = () => {
  const request = axios.get(`${baseUrl}/ranking`)
  return request.then(response => response.data)
}

export const API = { login, logout, getSession, getNetwork, startGame, submitRoute, getRanking }
