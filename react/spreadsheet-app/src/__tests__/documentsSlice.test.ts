import { beforeEach, describe, it, expect } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../store/rootReducer'
import {
  fetchDocs,
  fetchDoc,
  createDocThunk,
  deleteDocThunk,
  duplicateDocThunk,
  saveActiveDoc,
} from '../store/documentsSlice'
import { registerThunk } from '../store/authSlice'
import { setCell } from '../store/spreadsheetSlice'

function makeStore() {
  return configureStore({ reducer: rootReducer })
}

async function setupAuthedStore() {
  const store = makeStore()
  await store.dispatch(registerThunk({
    name: 'T', email: 't' + Math.random() + '@x.ru', password: '12345678'
  }))
  return store
}

describe('documentsSlice', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('fetchDocs загружает список', async () => {
    const store = await setupAuthedStore()
    await store.dispatch(createDocThunk({ name: 'D', rows: 5, cols: 5 }))
    await store.dispatch(fetchDocs())
    expect(store.getState().documents.list.length).toBe(1)
  })

  it('createDocThunk добавляет в list', async () => {
    const store = await setupAuthedStore()
    await store.dispatch(createDocThunk({ name: 'New', rows: 3, cols: 3 }))
    expect(store.getState().documents.list[0].name).toBe('New')
  })

  it('deleteDocThunk удаляет из list', async () => {
    const store = await setupAuthedStore()
    const created = await store.dispatch(
      createDocThunk({ name: 'D', rows: 5, cols: 5 })
    )
    const id = (created.payload as { id: string }).id
    await store.dispatch(deleteDocThunk(id))
    expect(store.getState().documents.list.length).toBe(0)
  })

  it('duplicateDocThunk создаёт копию', async () => {
    const store = await setupAuthedStore()
    const created = await store.dispatch(
      createDocThunk({ name: 'D', rows: 5, cols: 5 })
    )
    const id = (created.payload as { id: string }).id
    await store.dispatch(duplicateDocThunk(id))
    expect(store.getState().documents.list.length).toBe(2)
  })

  it('saveActiveDoc сохраняет ячейки', async () => {
    const store = await setupAuthedStore()
    const created = await store.dispatch(
      createDocThunk({ name: 'D', rows: 5, cols: 5 })
    )
    const id = (created.payload as { id: string }).id
    await store.dispatch(fetchDoc(id))
    store.dispatch(setCell({ row: 0, col: 0, value: '42' }))
    await store.dispatch(saveActiveDoc())
    const reloaded = await store.dispatch(fetchDoc(id))
    expect((reloaded.payload as unknown as { cells: { A1: string } }).cells.A1).toBe('42')
  })
})
