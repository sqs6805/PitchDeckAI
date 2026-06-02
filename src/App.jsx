import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import RateDeck from './pages/RateDeck'
import CreateDeck from './pages/CreateDeck'
import MarketResearch from './components/MarketResearch'
import { trackPageView } from './utils/analytics'

/** Fires a GA4 page_view on every route change */
function PageTracker() {
  const location = useLocation()
  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <PageTracker />
      <div className="min-h-screen bg-surface-900 text-slate-100 font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/rate" element={<RateDeck />} />
          <Route path="/create" element={<CreateDeck />} />
          <Route path="/research" element={<MarketResearch />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
