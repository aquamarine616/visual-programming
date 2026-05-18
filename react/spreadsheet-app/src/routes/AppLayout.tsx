import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logoutThunk } from '../store/authSlice'
import { clearDocs } from '../store/documentsSlice'

export default function AppLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(s => s.auth.user)

  async function handleLogout() {
    await dispatch(logoutThunk())
    dispatch(clearDocs())
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <Link to="/dashboard" className="app-logo">Таблицы</Link>
        <nav className="app-nav">
          <NavLink to="/dashboard">Мои документы</NavLink>
          <NavLink to="/profile">Профиль</NavLink>
        </nav>
        <div className="app-user">
          <span>{user?.name}</span>
          <button onClick={handleLogout}>Выйти</button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
