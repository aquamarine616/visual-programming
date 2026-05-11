import { beforeEach, describe, it, expect } from 'vitest'
import { createDoc, getDocs, getDoc, updateDoc, deleteDoc } from '../api'

describe('Тесты api', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('создает новый док', async () => {
    let doc = await createDoc('Док 1', 10, 5)
    expect(doc.name).toBe('Док 1')
    expect(doc.rows).toBe(10)
  })

  it('возвращает список', async () => {
    await createDoc('А', 10, 5)
    await createDoc('Б', 10, 5)
    let list = await getDocs()
    expect(list.length).toBe(2)
  })

  it('сохраняет ячейки', async () => {
    let doc = await createDoc('Док', 10, 5)
    await updateDoc(doc.id, { cells: { A1: '42' } })
    
    let result = await getDoc(doc.id)
    expect(result.cells.A1).toBe('42')
  })

  it('удаляет', async () => {
    let doc = await createDoc('Док', 10, 5)
    await deleteDoc(doc.id)
    
    let list = await getDocs()
    expect(list.length).toBe(0)
  })
})