import { describe, it, expect } from 'vitest'
import reducer, {
  loadDoc,
  setCell,
  insertRow,
  deleteRow,
  insertCol,
  setSelection,
  startEditing,
  stopEditing,
  undo,
  redo,
  SpreadsheetState,
} from '../store/spreadsheetSlice'
import { Doc } from '../types'

function emptyDoc(): Doc {
  return {
    id: 'd1', userId: 'u1', name: 'Doc', rows: 5, cols: 5,
    cells: {}, cellFormats: {}, colWidths: {}, rowHeights: {},
    createdAt: 0, updatedAt: 0,
  }
}

function loaded(): SpreadsheetState {
  return reducer(undefined, loadDoc(emptyDoc()))
}

describe('spreadsheetSlice', () => {
  it('setCell записывает значение', () => {
    let state = loaded()
    state = reducer(state, setCell({ row: 0, col: 0, value: '42' }))
    expect(state.cells['A1']).toBe('42')
  })

  it('setSelection обновляет выделение', () => {
    let state = loaded()
    state = reducer(state, setSelection({ row: 2, col: 3 }))
    expect(state.selRow).toBe(2)
    expect(state.selCol).toBe(3)
  })

  it('insertRow добавляет строку', () => {
    let state = loaded()
    state = reducer(state, setCell({ row: 1, col: 0, value: 'b' }))
    state = reducer(state, insertRow(1))
    expect(state.rows).toBe(6)
    expect(state.cells['A3']).toBe('b')
  })

  it('deleteRow удаляет строку', () => {
    let state = loaded()
    state = reducer(state, setCell({ row: 2, col: 0, value: 'c' }))
    state = reducer(state, deleteRow(1))
    expect(state.rows).toBe(4)
    expect(state.cells['A2']).toBe('c')
  })

  it('insertCol добавляет столбец', () => {
    let state = loaded()
    state = reducer(state, setCell({ row: 0, col: 1, value: 'B' }))
    state = reducer(state, insertCol(1))
    expect(state.cells['C1']).toBe('B')
  })

  it('startEditing / stopEditing', () => {
    let state = loaded()
    state = reducer(state, startEditing('hi'))
    expect(state.editing).toBe(true)
    expect(state.editValue).toBe('hi')
    state = reducer(state, stopEditing())
    expect(state.editing).toBe(false)
  })

  it('undo откатывает setCell', () => {
    let state = loaded()
    state = reducer(state, setCell({ row: 0, col: 0, value: '1' }))
    state = reducer(state, setCell({ row: 0, col: 0, value: '2' }))
    state = reducer(state, undo())
    expect(state.cells['A1']).toBe('1')
    state = reducer(state, undo())
    expect(state.cells['A1']).toBeUndefined()
  })

  it('redo повторяет отменённое', () => {
    let state = loaded()
    state = reducer(state, setCell({ row: 0, col: 0, value: '1' }))
    state = reducer(state, undo())
    state = reducer(state, redo())
    expect(state.cells['A1']).toBe('1')
  })
})
