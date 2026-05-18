import { useEffect } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { refreshThunk, setInitialized } from './store/authSlice'
import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './routes/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import SpreadsheetPage from './pages/SpreadsheetPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/documents/:documentId', element: <SpreadsheetPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

export default function App() {
  const dispatch = useAppDispatch()
  const initialized = useAppSelector(s => s.auth.initialized)

  useEffect(() => {

    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      dispatch(refreshThunk())
    } else {
      dispatch(setInitialized())
    }
  }, [dispatch])

  if (!initialized) {
    return <div className="loading">Загрузка…</div>
  }

  return <RouterProvider router={router} />
}
