import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { registerThunk, clearError } from '../store/authSlice'
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePasswordMatch,
} from '../utils/validation'

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(s => s.auth.user)
  const loading = useAppSelector(s => s.auth.loading)
  const serverError = useAppSelector(s => s.auth.error)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [nameErr, setNameErr] = useState<string | null>(null)
  const [emailErr, setEmailErr] = useState<string | null>(null)
  const [passwordErr, setPasswordErr] = useState<string | null>(null)
  const [confirmErr, setConfirmErr] = useState<string | null>(null)

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  useEffect(() => {
    return () => { dispatch(clearError()) }
  }, [dispatch])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nErr = validateName(name)
    const eErr = validateEmail(email)
    const pErr = validatePassword(password)
    const cErr = validatePasswordMatch(password, confirm)
    setNameErr(nErr)
    setEmailErr(eErr)
    setPasswordErr(pErr)
    setConfirmErr(cErr)
    if (nErr || eErr || pErr || cErr) return
    dispatch(registerThunk({ name, email, password }))
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Регистрация</h2>
        <label>
          Имя
          <input value={name} onChange={e => setName(e.target.value)} />
          {nameErr && <span className="form-error">{nameErr}</span>}
        </label>
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
            autoComplete="new-password"
          />
          {passwordErr && <span className="form-error">{passwordErr}</span>}
        </label>
        <label>
          Подтверждение пароля
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
          {confirmErr && <span className="form-error">{confirmErr}</span>}
        </label>
        {serverError && <div className="form-error">{serverError}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Регистрируем…' : 'Зарегистрироваться'}
        </button>
        <div className="auth-link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </form>
    </div>
  )
}
