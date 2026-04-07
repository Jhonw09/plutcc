import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage          from './pages/LandingPage'
import DashboardPage        from './components/dashboard/DashboardPage'
import TeacherDashboardPage from './pages/TeacherDashboardPage'
import AdminDashboardPage   from './pages/AdminDashboardPage'
import ProtectedRoute       from './components/ProtectedRoute'
import { useAuth }          from './context/AuthContext'

import './App.css'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<LandingPage key="landing" />} />
      <Route path="/cadastro" element={<LandingPage key="cadastro" initialAuth="signup" />} />

      <Route path="/dashboard" element={
        <ProtectedRoute role="student">
          <DashboardPage user={user} />
        </ProtectedRoute>
      } />

      <Route path="/teacher-dashboard" element={
        <ProtectedRoute role="teacher">
          <TeacherDashboardPage user={user} />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute role="admin">
          <AdminDashboardPage user={user} />
        </ProtectedRoute>
      } />

      {/* Catch-all — redirect to landing (unauthenticated) or their dashboard (authenticated) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
