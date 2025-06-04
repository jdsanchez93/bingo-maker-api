import { Route, Routes } from 'react-router'
import RequireAuth from './components/RequireAuth'
import Home from './pages/Home'
import GamePage from './pages/GamePage'
import CreateBoard from './pages/CreateBoard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/game"
        element={
          <RequireAuth>
            <GamePage />
          </RequireAuth>
        }
      />
      <Route
        path="/create-board"
        element={
          <RequireAuth>
            <CreateBoard />
          </RequireAuth>
        }
        />            
    </Routes>
  )
}