import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { TimeCapsuleProvider } from './context/TimeCapsuleContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Create from './pages/Create'
import Lock from './pages/Lock'
import CapsuleView from './pages/CapsuleView'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <TimeCapsuleProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<Create />} />
              <Route path="/lock" element={<Lock />} />
              <Route path="/capsule/:id" element={<CapsuleView />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#f0f0f0',
              border: '0.5px solid #2a2a2a',
              fontSize: '13px',
            },
          }}
        />
      </BrowserRouter>
    </TimeCapsuleProvider>
  )
}