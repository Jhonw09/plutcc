import { Navigate } from 'react-router-dom'
import Navbar       from '../components/Navbar'
import Hero         from '../components/Hero'
import Features     from '../components/Features'
import VideoSection from '../components/VideoSection'
import Subjects     from '../components/Subjects'
import Stats        from '../components/Stats'
import Testimonials from '../components/Testimonials'
import Resources    from '../components/Resources'
import CtaBanner    from '../components/CtaBanner'
import Footer       from '../components/Footer'
import { useAuth }  from '../context/AuthContext'
import { ROLE_ROUTES, DEFAULT_ROUTE } from '../constants/routes'

export default function LandingPage() {
  const { user } = useAuth()
  if (user) return <Navigate to={ROLE_ROUTES[user.role] ?? DEFAULT_ROUTE} replace />

  return (
    <>
      <Navbar />
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
    </>
  )
}
