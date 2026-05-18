import { beforeEach, describe, it, expect } from 'vitest'
import { createDoc, getDocs, getDoc, updateDoc, deleteDoc, ApiError } from '../api'
import { register } from '../auth'

let token = ''

describe('api', () => {
  beforeEach(async () => {
    localStorage.clear()
    const res = await register('Test', 'test@test.ru', '12345678')
    token = res.tokens.accessToken
  })

  it('создаёт документ', async () => {
    const d = await createDoc(token, 'Doc 1', 10, 5)
    expect(d.name).toBe('Doc 1')
    expect(d.rows).toBe(10)
    expect(d.userId).toBeTruthy()
  })

  it('возвращает список', async () => {
    await createDoc(token, 'A', 10, 5)
    await createDoc(token, 'B', 10, 5)
    const list = await getDocs(token)
    expect(list.length).toBe(2)
  })

  it('обновляет ячейки', async () => {
    const d = await createDoc(token, 'Doc', 10, 5)
    await updateDoc(token, d.id, { cells: { A1: '42' } })
    const got = await getDoc(token, d.id)
    expect(got.cells.A1).toBe('42')
  })

  it('удаляет документ', async () => {
    const d = await createDoc(token, 'Doc', 10, 5)
    await deleteDoc(token, d.id)
    const list = await getDocs(token)
    expect(list.length).toBe(0)
  })

  it('возвращает 403 при доступе к чужому документу', async () => {
    const d = await createDoc(token, 'Mine', 10, 5)
    const other = await register('Other', 'other@test.ru', '12345678')
    let err: ApiError | null = null
    try {
      await getDoc(other.tokens.accessToken, d.id)
    } catch (e) {
      err = e as ApiError
    }
    expect(err).not.toBeNull()
    expect(err?.status).toBe(403)
  })
})
