import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
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
import { ROLE_ROUTES, DEFAULT_ROUTE } from '../constants/routes'

export default function LandingPage({ initialAuth = null }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  // All hooks must be declared before any conditional return (Rules of Hooks)
  const [authOpen,     setAuthOpen]     = useState(() => initialAuth !== null)
  const [authMode,     setAuthMode]     = useState(() => initialAuth ?? 'login')
  const [phase,        setPhase]        = useState('idle')
  const [overlayLabel, setOverlayLabel] = useState('Entrando...')

  // Redirect authenticated users — placed AFTER all hooks
  if (user) return <Navigate to={ROLE_ROUTES[user.role] ?? DEFAULT_ROUTE} replace />

  function openAuth(mode) {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  function closeAuth() {
    setAuthOpen(false)
    // Clean up the URL if the modal was opened via /cadastro
    if (window.location.pathname === '/cadastro') {
      navigate('/', { replace: true })
    }
  }

  function handleAuthSuccess(mode) {
    setOverlayLabel(mode === 'login' ? 'Entrando...' : 'Criando seu painel...')
    setPhase('leaving')
    // The user is already in context at this point (login() resolved).
    // The Navigate redirect at the top of this component fires as soon
    // as React re-renders with the new user, so no manual navigate() needed.
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
          onClose={closeAuth}
          onSuccess={(mode) => handleAuthSuccess(mode)}
        />
      )}
    </>
  )
}
