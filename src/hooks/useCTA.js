import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_ROUTES, DEFAULT_ROUTE } from '../constants/routes'

export function useCTA() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return function handleCTA(e) {
    if (e?.preventDefault) e.preventDefault()
    if (user) {
      navigate(ROLE_ROUTES[user.role] ?? DEFAULT_ROUTE)
    } else {
      // If already on /cadastro the URL won't change and React Router
      // won't remount the component. Navigate to / first (replace so it
      // doesn't pollute history), then to /cadastro on the next tick.
      if (location.pathname === '/cadastro') {
        navigate('/', { replace: true })
        setTimeout(() => navigate('/cadastro'), 0)
      } else {
        navigate('/cadastro')
      }
    }
  }
}
