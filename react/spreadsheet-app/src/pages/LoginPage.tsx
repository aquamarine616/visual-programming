import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginThunk, clearError } from '../store/authSlice'
import { validateEmail, validatePassword } from '../utils/validation'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector(s => s.auth.user)
  const loading = useAppSelector(s => s.auth.loading)
  const serverError = useAppSelector(s => s.auth.error)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailErr, setEmailErr] = useState<string | null>(null)
  const [passwordErr, setPasswordErr] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      const from = (location.state as { from?: string } | null)?.from || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [user, navigate, location.state])

  useEffect(() => {
    return () => { dispatch(clearError()) }
  }, [dispatch])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const eErr = validateEmail(email)
    const pErr = validatePassword(password)
    setEmailErr(eErr)
    setPasswordErr(pErr)
    if (eErr || pErr) return
    dispatch(loginThunk({ email, password }))
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Вход</h2>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
          {emailErr && <span className="form-error">{emailErr}</span>}
        </label>
        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {passwordErr && <span className="form-error">{passwordErr}</span>}
        </label>
        {serverError && <div className="form-error">{serverError}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Входим…' : 'Войти'}
        </button>
        <div className="auth-link">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </div>
      </form>
    </div>
  )
}
