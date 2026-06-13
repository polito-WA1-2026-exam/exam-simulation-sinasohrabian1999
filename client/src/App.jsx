import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from './contexts/UserContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './components/HomePage'
import LoginPage from './components/LoginPage'
import GamePage from './components/GamePage'
import RankingPage from './components/RankingPage'

const App = () => {
  const { user } = useUser()

  if (user === undefined) {
    return <div style={{ padding: 40, color: 'var(--text-dim)' }}>Loading…</div>
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/game" element={user ? <GamePage /> : <Navigate to="/login" replace />} />
        <Route path="/ranking" element={user ? <RankingPage /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
