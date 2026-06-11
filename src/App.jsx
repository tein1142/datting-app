import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import AskPage from './pages/AskPage.jsx'
import PlanPage from './pages/PlanPage.jsx'
import SummaryPage from './pages/SummaryPage.jsx'
import Hearts from './components/Hearts.jsx'

export default function App() {
  const location = useLocation()
  return (
    <div className="app">
      <Hearts />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AskPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="*" element={<AskPage />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}
