import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import VideoSection from './components/VideoSection'
import Subjects from './components/Subjects'
import Stats from './components/Stats'
import Testimonials from './components/Testimonials'
import Plans from './components/Plans'
import CtaBanner from './components/CtaBanner'
import Footer from './components/Footer'
import './App.css'

export default function App() {
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
        <Plans />
        <CtaBanner />
      </main>
      <Footer />
    </>
  )
}
