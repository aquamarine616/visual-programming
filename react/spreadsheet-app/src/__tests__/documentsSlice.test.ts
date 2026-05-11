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

describe('Тесты documentsSlice', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('должен загружать список документов', async () => {
    let store = configureStore({ reducer: rootReducer })
    await store.dispatch(createDocThunk({ name: 'Док1', rows: 5, cols: 5 }) as any)
    await store.dispatch(fetchDocs() as any)
    let state = store.getState()
    expect(state.documents.list.length).toBe(1)
  })

  it('должен добавлять документ в list', async () => {
    let store = configureStore({ reducer: rootReducer })
    await store.dispatch(createDocThunk({ name: 'Новый', rows: 3, cols: 3 }) as any)
    let state = store.getState()
    expect(state.documents.list[0].name).toBe('Новый')
  })

  it('должен удалять документ из list', async () => {
    let store = configureStore({ reducer: rootReducer })
    let res = await store.dispatch(createDocThunk({ name: 'УдалитьМеня', rows: 5, cols: 5 }) as any)
    let id = res.payload.id
    
    await store.dispatch(deleteDocThunk(id) as any)
    
    let state = store.getState()
    expect(state.documents.list.length).toBe(0)
  })

  it('должен делать дубликат', async () => {
    let store = configureStore({ reducer: rootReducer })
    let res = await store.dispatch(createDocThunk({ name: 'Оригинал', rows: 5, cols: 5 }) as any)
    let id = res.payload.id
    
    await store.dispatch(duplicateDocThunk(id) as any)
    
    let state = store.getState()
    expect(state.documents.list.length).toBe(2)
  })

  it('должен сохранять ячейки активного документа', async () => {
    let store = configureStore({ reducer: rootReducer })
    let res = await store.dispatch(createDocThunk({ name: 'Тест', rows: 5, cols: 5 }) as any)
    let id = res.payload.id
    
    await store.dispatch(fetchDoc(id) as any)
    store.dispatch(setCell({ row: 0, col: 0, value: '42' }))
    await store.dispatch(saveActiveDoc() as any)
    
    let reloaded = await store.dispatch(fetchDoc(id) as any)
    expect(reloaded.payload.cells.A1).toBe('42')
  })
})