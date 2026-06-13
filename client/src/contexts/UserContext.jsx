import { createContext, useContext, useState, useEffect } from 'react'
import { API } from '../services/gameService'

const UserContext = createContext()

export const UserProvider = (props) => {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    API.getSession()
      .then(u => setUser(u))
      .catch(() => setUser(null))
  }, [])

  const login = async (username, password) => {
    const u = await API.login(username, password)
    setUser(u)
    return u
  }

  const logout = async () => {
    await API.logout()
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {props.children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  return useContext(UserContext)
}
