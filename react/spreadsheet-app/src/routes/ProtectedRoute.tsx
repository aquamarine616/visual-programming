import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'

export default function ProtectedRoute() {
  const user = useAppSelector(s => s.auth.user)
  const initialized = useAppSelector(s => s.auth.initialized)
  const location = useLocation()

  if (!initialized) {
    return <div className="loading">Загрузка…</div>
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return <Outlet />
}
