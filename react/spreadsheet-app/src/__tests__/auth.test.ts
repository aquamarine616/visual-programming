import { beforeEach, describe, it, expect } from 'vitest'
import { register, login, refresh, updatePassword, updateName, parseToken } from '../auth'

describe('auth', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('register создаёт пользователя и возвращает токены', async () => {
    const res = await register('Иван', 'ivan@test.ru', '12345678')
    expect(res.user.email).toBe('ivan@test.ru')
    expect(res.tokens.accessToken).toBeTruthy()
    expect(res.tokens.refreshToken).toBeTruthy()
  })

  it('не даёт зарегистрировать с тем же email', async () => {
    await register('A', 'a@a.ru', '12345678')
    let err: Error | null = null
    try {
      await register('B', 'a@a.ru', '12345678')
    } catch (e) {
      err = e as Error
    }
    expect(err).not.toBeNull()
  })

  it('login возвращает токены при верном пароле', async () => {
    await register('A', 'a@a.ru', '12345678')
    const res = await login('a@a.ru', '12345678')
    expect(res.user.email).toBe('a@a.ru')
  })

  it('login с неверным паролем падает', async () => {
    await register('A', 'a@a.ru', '12345678')
    let err: Error | null = null
    try {
      await login('a@a.ru', 'wrong-pwd')
    } catch (e) {
      err = e as Error
    }
    expect(err).not.toBeNull()
  })

  it('refresh выдаёт новые токены', async () => {
    await register('A', 'a@a.ru', '12345678')
    const res = await refresh()
    expect(res.tokens.accessToken).toBeTruthy()
  })

  it('updatePassword меняет пароль', async () => {
    const r = await register('A', 'a@a.ru', '12345678')
    await updatePassword(r.user.id, '12345678', '87654321')
    const res = await login('a@a.ru', '87654321')
    expect(res.user.id).toBe(r.user.id)
  })

  it('updateName меняет имя', async () => {
    const r = await register('Old', 'a@a.ru', '12345678')
    const updated = await updateName(r.user.id, 'New')
    expect(updated.name).toBe('New')
  })

  it('parseToken парсит payload токена', async () => {
    const r = await register('A', 'a@a.ru', '12345678')
    const payload = parseToken(r.tokens.accessToken)
    expect(payload?.userId).toBe(r.user.id)
  })
})
