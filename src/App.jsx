import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import VideoSection from './components/VideoSection'
import Subjects from './components/Subjects'
import Stats from './components/Stats'
import Testimonials from './components/Testimonials'
import Resources from './components/Resources'
import CtaBanner from './components/CtaBanner'
import Footer from './components/Footer'
import AuthForm from './components/AuthForm'
import DashboardPage        from './components/dashboard/DashboardPage'
import TeacherDashboardPage from './pages/TeacherDashboardPage'
import TransitionOverlay    from './components/TransitionOverlay'
import { useState } from 'react'
import './App.css'

const LEAVE_MS = 400
const ENTER_MS = 350

export default function App() {
  const [authOpen, setAuthOpen]         = useState(false)
  const [authMode, setAuthMode]         = useState('login')
  const [loggedIn, setLoggedIn]         = useState(false)
  const [userRole, setUserRole]         = useState('student')  // 'student' | 'teacher'
  const [phase, setPhase]               = useState('idle')
  const [overlayLabel, setOverlayLabel] = useState('Entrando...')

  function openAuth(mode) {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  function handleAuthSuccess(mode, role = 'student') {
    setOverlayLabel(mode === 'login' ? 'Entrando...' : 'Criando seu painel...')
    setUserRole(role)
    setAuthOpen(false)
    setPhase('leaving')
    setTimeout(() => {
      setLoggedIn(true)
      setPhase('entering')
      setTimeout(() => setPhase('idle'), ENTER_MS)
    }, LEAVE_MS)
  }

  return (
    <>
      {/* Overlay sits above everything — rendered regardless of page */}
      {phase !== 'idle' && (
        <TransitionOverlay phase={phase === 'leaving' ? 'out' : 'in'} label={overlayLabel} />
      )}

      {loggedIn ? (
        userRole === 'teacher'
          ? <TeacherDashboardPage user={{ name: 'Maria', avatar: 'M' }} />
          : <DashboardPage        user={{ name: 'João',  avatar: 'J' }} />
      ) : (
        <>
          <Navbar onOpenAuth={openAuth} />
          <main>
            <Hero />
            <Features />
            <VideoSection />
            <Subjects />
            <Stats />
            <Testimonials />
            <Resources />
            <CtaBanner />
          </main>
          <Footer />
          {authOpen && (
            <AuthForm
              initialMode={authMode}
              onClose={() => setAuthOpen(false)}
              onSuccess={(mode, role) => handleAuthSuccess(mode, role)}
            />
          )}
        </>
      )}
    </>
  )
}
