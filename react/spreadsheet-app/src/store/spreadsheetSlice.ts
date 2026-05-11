import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Cells, Doc } from '../types'
import { cellKey, colToLetter, letterToCol } from '../utils/cellRef'

type UndoItem = { key: string; value: string }

export type SpreadsheetState = {
  cells: Cells
  rows: number
  cols: number
  colWidths: { [col: number]: number }
  rowHeights: { [row: number]: number }
  selRow: number
  selCol: number
  selEndRow: number
  selEndCol: number
  editing: boolean
  editValue: string
  undoStack: UndoItem[]
  redoStack: UndoItem[]
}

const initialState: SpreadsheetState = {
  cells: {},
  rows: 0,
  cols: 0,
  colWidths: {},
  rowHeights: {},
  selRow: 0,
  selCol: 0,
  selEndRow: 0,
  selEndCol: 0,
  editing: false,
  editValue: '',
  undoStack: [],
  redoStack: [],
}

const slice = createSlice({
  name: 'spreadsheet',
  initialState,
  reducers: {
    loadDoc(state, action: PayloadAction<Doc>) {
      const d = action.payload
      state.cells = { ...d.cells }
      state.rows = d.rows
      state.cols = d.cols
      state.colWidths = { ...d.colWidths }
      state.rowHeights = { ...d.rowHeights }
      state.selRow = 0
      state.selCol = 0
      state.selEndRow = 0
      state.selEndCol = 0
      state.editing = false
      state.editValue = ''
      state.undoStack = []
      state.redoStack = []
    },
    reset() {
      return initialState
    },
    setCell(state, action: PayloadAction<{ row: number; col: number; value: string }>) {
      const { row, col, value } = action.payload
      const key = cellKey(row, col)
      const old = state.cells[key] || ''
      if (old === value) return
      state.undoStack.push({ key, value: old })
      if (state.undoStack.length > 50) state.undoStack.shift()
      state.redoStack = []
      if (value === '') delete state.cells[key]
      else state.cells[key] = value
    },
    setColWidth(state, action: PayloadAction<{ col: number; width: number }>) {
      state.colWidths[action.payload.col] = action.payload.width
    },
    setRowHeight(state, action: PayloadAction<{ row: number; height: number }>) {
      state.rowHeights[action.payload.row] = action.payload.height
    },
    insertRow(state, action: PayloadAction<number>) {
      const at = action.payload
      const newCells: Cells = {}
      for (const key of Object.keys(state.cells)) {
        const m = key.match(/^([A-Z]+)(\d+)$/)
        if (!m) continue
        const row = parseInt(m[2], 10) - 1
        if (row >= at) newCells[m[1] + (row + 2)] = state.cells[key]
        else newCells[key] = state.cells[key]
      }
      state.cells = newCells
      state.rows += 1
    },
    deleteRow(state, action: PayloadAction<number>) {
      if (state.rows <= 1) return
      const at = action.payload
      const newCells: Cells = {}
      for (const key of Object.keys(state.cells)) {
        const m = key.match(/^([A-Z]+)(\d+)$/)
        if (!m) continue
        const row = parseInt(m[2], 10) - 1
        if (row === at) continue
        if (row > at) newCells[m[1] + row] = state.cells[key]
        else newCells[key] = state.cells[key]
      }
      state.cells = newCells
      state.rows -= 1
    },
    insertCol(state, action: PayloadAction<number>) {
      const at = action.payload
      const newCells: Cells = {}
      for (const key of Object.keys(state.cells)) {
        const m = key.match(/^([A-Z]+)(\d+)$/)
        if (!m) continue
        const col = letterToCol(m[1])
        if (col >= at) newCells[colToLetter(col + 1) + m[2]] = state.cells[key]
        else newCells[key] = state.cells[key]
      }
      state.cells = newCells
      state.cols += 1
    },
    deleteCol(state, action: PayloadAction<number>) {
      if (state.cols <= 1) return
      const at = action.payload
      const newCells: Cells = {}
      for (const key of Object.keys(state.cells)) {
        const m = key.match(/^([A-Z]+)(\d+)$/)
        if (!m) continue
        const col = letterToCol(m[1])
        if (col === at) continue
        if (col > at) newCells[colToLetter(col - 1) + m[2]] = state.cells[key]
        else newCells[key] = state.cells[key]
      }
      state.cells = newCells
      state.cols -= 1
    },
    setSelection(state, action: PayloadAction<{ row: number; col: number; extend?: boolean }>) {
      const { row, col, extend } = action.payload
      if (extend) {
        state.selEndRow = row
        state.selEndCol = col
      } else {
        state.selRow = row
        state.selCol = col
        state.selEndRow = row
        state.selEndCol = col
      }
    },
    startEditing(state, action: PayloadAction<string>) {
      state.editing = true
      state.editValue = action.payload
    },
    setEditValue(state, action: PayloadAction<string>) {
      state.editValue = action.payload
    },
    stopEditing(state) {
      state.editing = false
      state.editValue = ''
    },
    undo(state) {
      const item = state.undoStack.pop()
      if (!item) return
      const cur = state.cells[item.key] || ''
      state.redoStack.push({ key: item.key, value: cur })
      if (item.value === '') delete state.cells[item.key]
      else state.cells[item.key] = item.value
    },
    redo(state) {
      const item = state.redoStack.pop()
      if (!item) return
      const cur = state.cells[item.key] || ''
      state.undoStack.push({ key: item.key, value: cur })
      if (item.value === '') delete state.cells[item.key]
      else state.cells[item.key] = item.value
    },
    importCells(state, action: PayloadAction<{ cells: Cells; rows: number; cols: number }>) {
      state.cells = { ...action.payload.cells }
      state.rows = Math.max(action.payload.rows, state.rows)
      state.cols = Math.max(action.payload.cols, state.cols)
      state.undoStack = []
      state.redoStack = []
    },
  },
})

export const {
  loadDoc,
  reset,
  setCell,
  setColWidth,
  setRowHeight,
  insertRow,
  deleteRow,
  insertCol,
  deleteCol,
  setSelection,
  startEditing,
  setEditValue,
  stopEditing,
  undo,
  redo,
  importCells,
} = slice.actions

export default slice.reducer

export const SPREADSHEET_MUTATION_TYPES = [
  setCell.type,
  setColWidth.type,
  setRowHeight.type,
  insertRow.type,
  deleteRow.type,
  insertCol.type,
  deleteCol.type,
  undo.type,
  redo.type,
  importCells.type,
]