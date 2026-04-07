import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps a route that requires authentication.
 * Optionally restricts to a specific role.
 *
 * Usage:
 *   <Route path="/dashboard" element={
 *     <ProtectedRoute role="student"><DashboardPage /></ProtectedRoute>
 *   } />
 */
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />

  return children
}
