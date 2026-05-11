import { beforeEach, describe, it, expect } from 'vitest'
import { createDoc, getDocs, getDoc, updateDoc, deleteDoc } from '../api'

describe('api', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('создаёт документ', async () => {
    const d = await createDoc('Doc 1', 10, 5)
    expect(d.name).toBe('Doc 1')
    expect(d.rows).toBe(10)
  })

  it('возвращает список', async () => {
    await createDoc('A', 10, 5)
    await createDoc('B', 10, 5)
    const list = await getDocs()
    expect(list.length).toBe(2)
  })

  it('обновляет ячейки', async () => {
    const d = await createDoc('Doc', 10, 5)
    await updateDoc(d.id, { cells: { A1: '42' } })
    const got = await getDoc(d.id)
    expect(got.cells.A1).toBe('42')
  })

  it('удаляет документ', async () => {
    const d = await createDoc('Doc', 10, 5)
    await deleteDoc(d.id)
    const list = await getDocs()
    expect(list.length).toBe(0)
  })
})