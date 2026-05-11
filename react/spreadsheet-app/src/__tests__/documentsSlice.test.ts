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
import { setCell } from '../store/spreadsheetSlice'

function makeStore() {
  return configureStore({ reducer: rootReducer })
}

describe('documentsSlice', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('fetchDocs загружает список', async () => {
    const store = makeStore()
    await store.dispatch(createDocThunk({ name: 'D', rows: 5, cols: 5 }))
    await store.dispatch(fetchDocs())
    expect(store.getState().documents.list.length).toBe(1)
  })

  it('createDocThunk добавляет в list', async () => {
    const store = makeStore()
    await store.dispatch(createDocThunk({ name: 'New', rows: 3, cols: 3 }))
    expect(store.getState().documents.list[0].name).toBe('New')
  })

  it('deleteDocThunk удаляет из list', async () => {
    const store = makeStore()
    const created = await store.dispatch(
      createDocThunk({ name: 'D', rows: 5, cols: 5 })
    )
    const id = (created.payload as any).id
    await store.dispatch(deleteDocThunk(id))
    expect(store.getState().documents.list.length).toBe(0)
  })

  it('duplicateDocThunk создаёт копию', async () => {
    const store = makeStore()
    const created = await store.dispatch(
      createDocThunk({ name: 'D', rows: 5, cols: 5 })
    )
    const id = (created.payload as any).id
    await store.dispatch(duplicateDocThunk(id))
    expect(store.getState().documents.list.length).toBe(2)
  })

  it('saveActiveDoc сохраняет ячейки', async () => {
    const store = makeStore()
    const created = await store.dispatch(
      createDocThunk({ name: 'D', rows: 5, cols: 5 })
    )
    const id = (created.payload as any).id
    await store.dispatch(fetchDoc(id))
    store.dispatch(setCell({ row: 0, col: 0, value: '42' }))
    await store.dispatch(saveActiveDoc())
    const reloaded = await store.dispatch(fetchDoc(id))
    expect((reloaded.payload as any).cells.A1).toBe('42')
  })
})