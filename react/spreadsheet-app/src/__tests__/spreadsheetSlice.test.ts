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
  redo
} from '../store/spreadsheetSlice'

describe('Тесты spreadsheetSlice', () => {
  
  // Упростили функцию генерации состояния
  function getInitial() {
    let doc = {
      id: '123', 
      name: 'Test', 
      rows: 5, 
      cols: 5,
      cells: {}, 
      colWidths: {}, 
      rowHeights: {},
      createdAt: 0, 
      updatedAt: 0,
    }
    return reducer(undefined, loadDoc(doc as any))
  }

  it('ставит значение в ячейку', () => {
    let state = getInitial()
    state = reducer(state, setCell({ row: 0, col: 0, value: '42' }))
    expect(state.cells['A1']).toBe('42')
  })

  it('выделение работает', () => {
    let state = getInitial()
    state = reducer(state, setSelection({ row: 2, col: 3 }))
    expect(state.selRow).toBe(2)
    expect(state.selCol).toBe(3)
  })

  it('добавляет строку', () => {
    let state = getInitial()
    state = reducer(state, setCell({ row: 1, col: 0, value: 'b' }))
    state = reducer(state, insertRow(1))
    expect(state.rows).toBe(6)
    expect(state.cells['A3']).toBe('b')
  })

  it('удаляет строку', () => {
    let state = getInitial()
    state = reducer(state, setCell({ row: 2, col: 0, value: 'c' }))
    state = reducer(state, deleteRow(1))
    expect(state.rows).toBe(4)
    expect(state.cells['A2']).toBe('c')
  })

  it('вставляет колонку', () => {
    let state = getInitial()
    state = reducer(state, setCell({ row: 0, col: 1, value: 'B' }))
    state = reducer(state, insertCol(1))
    expect(state.cells['C1']).toBe('B')
  })

  it('редактирование включается', () => {
    let state = getInitial()
    state = reducer(state, startEditing('привет'))
    expect(state.editing).toBe(true)
    expect(state.editValue).toBe('привет')
    
    state = reducer(state, stopEditing())
    expect(state.editing).toBe(false)
  })

  it('undo отменяет', () => {
    let state = getInitial()
    state = reducer(state, setCell({ row: 0, col: 0, value: '1' }))
    state = reducer(state, setCell({ row: 0, col: 0, value: '2' }))
    
    state = reducer(state, undo())
    expect(state.cells['A1']).toBe('1')
    
    state = reducer(state, undo())
    expect(state.cells['A1']).toBeUndefined()
  })

  it('redo возвращает', () => {
    let state = getInitial()
    state = reducer(state, setCell({ row: 0, col: 0, value: '1' }))
    state = reducer(state, undo())
    state = reducer(state, redo())
    expect(state.cells['A1']).toBe('1')
  })
})