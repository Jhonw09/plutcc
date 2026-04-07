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

const ROLE_ROUTES = {
  teacher: '/teacher-dashboard',
  student: '/dashboard',
  admin:   '/admin',
}

export default function LandingPage({ initialAuth = null }) {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  // All hooks must be declared before any conditional return (Rules of Hooks)
  const [authOpen,     setAuthOpen]     = useState(() => initialAuth !== null)
  const [authMode,     setAuthMode]     = useState(() => initialAuth ?? 'login')
  const [phase,        setPhase]        = useState('idle')
  const [overlayLabel, setOverlayLabel] = useState('Entrando...')

  // Redirect authenticated users — placed AFTER all hooks
  if (user) return <Navigate to={ROLE_ROUTES[user.role] ?? '/dashboard'} replace />

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

  function handleAuthSuccess(mode, role = 'student', name = '') {
    setOverlayLabel(mode === 'login' ? 'Entrando...' : 'Criando seu painel...')
    setPhase('leaving')
    setTimeout(() => {
      login({
        name:   name || (role === 'teacher' ? 'Professor' : role === 'admin' ? 'Admin' : 'Aluno'),
        avatar: (name || 'U').charAt(0).toUpperCase(),
        role,
      })
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
          onClose={closeAuth}
          onSuccess={(mode, role, name) => handleAuthSuccess(mode, role, name)}
        />
      )}
    </>
  )
}
