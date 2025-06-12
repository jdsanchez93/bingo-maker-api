import { Route, Routes } from 'react-router'
import RequireAuth from './components/RequireAuth'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import GamePage from './pages/GamePage'
import CreateBoard from './pages/CreateBoard'
import ChatComponent from './pages/ChatComponent'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/game/:gameId"
        element={
          <RequireAuth>
            <GamePage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />
      <Route
        path="/create-board/:gameId"
        element={
          <RequireAuth>
            <CreateBoard />
          </RequireAuth>
        }
      />
      <Route
        path="/message"
        element={<ChatComponent />}
      />
    </Routes>
  )
}