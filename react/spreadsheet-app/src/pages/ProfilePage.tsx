import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { updateNameThunk, updatePasswordThunk } from '../store/authSlice'
import { validateName, validatePassword, validatePasswordMatch } from '../utils/validation'
import { countDocs } from '../api'

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(s => s.auth.user)
  const accessToken = useAppSelector(s => s.auth.accessToken)
  const docsCount = useAppSelector(s => s.documents.list.length)

  const [name, setName] = useState(user?.name || '')
  const [nameMessage, setNameMessage] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [nameLoading, setNameLoading] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwdMessage, setPwdMessage] = useState<string | null>(null)
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [pwdLoading, setPwdLoading] = useState(false)

  const [statsCount, setStatsCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    if (accessToken) {
      countDocs(accessToken)
        .then(n => { if (!cancelled) setStatsCount(n) })
        .catch(() => { if (!cancelled) setStatsCount(docsCount) })
    }
    return () => { cancelled = true }
  }, [accessToken, docsCount])

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    setNameMessage(null)
    setNameError(null)
    const err = validateName(name)
    if (err) { setNameError(err); return }
    setNameLoading(true)
    const res = await dispatch(updateNameThunk(name))
    setNameLoading(false)
    if (updateNameThunk.fulfilled.match(res)) setNameMessage('Имя обновлено')
    else setNameError((res.payload as string) || 'Ошибка')
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwdMessage(null)
    setPwdError(null)
    const pErr = validatePassword(newPassword)
    const cErr = validatePasswordMatch(newPassword, confirm)
    if (!oldPassword) { setPwdError('Введите текущий пароль'); return }
    if (pErr) { setPwdError(pErr); return }
    if (cErr) { setPwdError(cErr); return }
    setPwdLoading(true)
    const res = await dispatch(updatePasswordThunk({ oldPassword, newPassword }))
    setPwdLoading(false)
    if (updatePasswordThunk.fulfilled.match(res)) {
      setPwdMessage('Пароль обновлён')
      setOldPassword('')
      setNewPassword('')
      setConfirm('')
    } else {
      setPwdError((res.payload as string) || 'Ошибка')
    }
  }

  if (!user) return <div className="loading">Загрузка…</div>

  return (
    <div className="profile-page">
      <h2>Профиль</h2>

      <div className="profile-section">
        <div><b>Email:</b> {user.email}</div>
        <div><b>Имя:</b> {user.name}</div>
        <div><b>Дата регистрации:</b> {new Date(user.createdAt).toLocaleString()}</div>
        <div><b>Документов:</b> {statsCount === null ? '…' : statsCount}</div>
      </div>

      <form className="profile-form" onSubmit={handleSaveName}>
        <h3>Изменить имя</h3>
        <input value={name} onChange={e => setName(e.target.value)} />
        <button type="submit" disabled={nameLoading}>
          {nameLoading ? 'Сохраняем…' : 'Сохранить'}
        </button>
        {nameError && <div className="form-error">{nameError}</div>}
        {nameMessage && <div className="form-ok">{nameMessage}</div>}
      </form>

      <form className="profile-form" onSubmit={handleChangePassword}>
        <h3>Изменить пароль</h3>
        <label>
          Текущий пароль
          <input
            type="password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <label>
          Новый пароль
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        <label>
          Подтверждение нового пароля
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        <button type="submit" disabled={pwdLoading}>
          {pwdLoading ? 'Сохраняем…' : 'Сменить пароль'}
        </button>
        {pwdError && <div className="form-error">{pwdError}</div>}
        {pwdMessage && <div className="form-ok">{pwdMessage}</div>}
      </form>
    </div>
  )
}
