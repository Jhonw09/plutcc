import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import Navbar    from '../components/Navbar'
import Hero      from '../components/Hero'
import Features  from '../components/Features'
import VideoSection from '../components/VideoSection'
import Subjects  from '../components/Subjects'
import Stats     from '../components/Stats'
import Testimonials from '../components/Testimonials'
import Resources from '../components/Resources'
import CtaBanner from '../components/CtaBanner'
import Footer    from '../components/Footer'
import AuthForm  from '../components/AuthForm'
import TransitionOverlay from '../components/TransitionOverlay'
import { useAuth } from '../context/AuthContext'

const ROLE_ROUTES = {
  teacher: '/teacher-dashboard',
  student: '/dashboard',
  admin:   '/admin',
}

export default function LandingPage() {
  const { login, user } = useAuth()

  // All hooks must be declared before any conditional return (Rules of Hooks)
  const [authOpen,     setAuthOpen]     = useState(false)
  const [authMode,     setAuthMode]     = useState('login')
  const [phase,        setPhase]        = useState('idle')
  const [overlayLabel, setOverlayLabel] = useState('Entrando...')

  // Redirect authenticated users — placed AFTER all hooks
  if (user) return <Navigate to={ROLE_ROUTES[user.role] ?? '/dashboard'} replace />

  function openAuth(mode) {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  function handleAuthSuccess(mode, role = 'student') {
    setOverlayLabel(mode === 'login' ? 'Entrando...' : 'Criando seu painel...')
    setPhase('leaving')

    // login() updates AuthContext — after the overlay delay, the user state
    // will be set and the <Navigate> above will handle routing automatically.
    // No navigate() call needed here — that was causing the double-navigation flicker.
    setTimeout(() => {
      login({
        name:   role === 'teacher' ? 'Maria' : role === 'admin' ? 'Admin' : 'João',
        avatar: role === 'teacher' ? 'M'     : role === 'admin' ? 'A'     : 'J',
        role,
      })
      // phase will be cleaned up but the component unmounts via Navigate anyway
    }, 400)
  }

  return (
    <>
      {phase !== 'idle' && (
        <TransitionOverlay
          phase={phase === 'leaving' ? 'out' : 'in'}
          label={overlayLabel}
        />
      )}

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
  )
}
