import { Route, Routes } from 'react-router'
import RequireAuth from './components/RequireAuth'
import Home from './pages/Home'
import Game from './pages/Game'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/game"
        element={
          <RequireAuth>
            <Game />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />
    </Routes>
  )
}