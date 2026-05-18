import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Cells, CellFormat, CellFormats, Doc } from '../types'
import { cellKey, colToLetter, letterToCol } from '../utils/cellRef'

type UndoItem =
  | { type: 'cell'; key: string; value: string }
  | { type: 'format'; key: string; format: CellFormat | undefined }

type ClipboardCell = { row: number; col: number; value: string; format: CellFormat | undefined }

export type SpreadsheetState = {
  cells: Cells
  cellFormats: CellFormats
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
  clipboard: ClipboardCell[] | null
  dirty: boolean
}

const initialState: SpreadsheetState = {
  cells: {},
  cellFormats: {},
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
  clipboard: null,
  dirty: false,
}

function pushUndo(state: SpreadsheetState, item: UndoItem) {
  state.undoStack.push(item)
  if (state.undoStack.length > 50) state.undoStack.shift()
  state.redoStack = []
}

const slice = createSlice({
  name: 'spreadsheet',
  initialState,
  reducers: {
    loadDoc(state, action: PayloadAction<Doc>) {
      const d = action.payload
      state.cells = { ...d.cells }
      state.cellFormats = { ...(d.cellFormats || {}) }
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
      state.clipboard = null
      state.dirty = false
    },
    reset() {
      return initialState
    },
    setCell(state, action: PayloadAction<{ row: number; col: number; value: string }>) {
      const { row, col, value } = action.payload
      const key = cellKey(row, col)
      const old = state.cells[key] || ''
      if (old === value) return
      pushUndo(state, { type: 'cell', key, value: old })
      if (value === '') delete state.cells[key]
      else state.cells[key] = value
      state.dirty = true
    },
    setCellFormat(state, action: PayloadAction<{ row: number; col: number; patch: Partial<CellFormat> }>) {
      const { row, col, patch } = action.payload
      const key = cellKey(row, col)
      const prev = state.cellFormats[key]
      pushUndo(state, { type: 'format', key, format: prev ? { ...prev } : undefined })
      const next: CellFormat = { ...(prev || {}), ...patch }

      for (const k of Object.keys(next) as (keyof CellFormat)[]) {
        if (next[k] === undefined || next[k] === false || next[k] === '') delete next[k]
      }
      if (Object.keys(next).length === 0) delete state.cellFormats[key]
      else state.cellFormats[key] = next
      state.dirty = true
    },
    clearCells(state, action: PayloadAction<Array<{ row: number; col: number }>>) {
      for (const { row, col } of action.payload) {
        const key = cellKey(row, col)
        const old = state.cells[key] || ''
        if (old !== '') {
          pushUndo(state, { type: 'cell', key, value: old })
          delete state.cells[key]
          state.dirty = true
        }
      }
    },
    setColWidth(state, action: PayloadAction<{ col: number; width: number }>) {
      state.colWidths[action.payload.col] = action.payload.width
      state.dirty = true
    },
    setRowHeight(state, action: PayloadAction<{ row: number; height: number }>) {
      state.rowHeights[action.payload.row] = action.payload.height
      state.dirty = true
    },
    insertRow(state, action: PayloadAction<number>) {
      const at = action.payload
      const newCells: Cells = {}
      const newFormats: CellFormats = {}
      for (const key of Object.keys(state.cells)) {
        const m = key.match(/^([A-Z]+)(\d+)$/)
        if (!m) continue
        const row = parseInt(m[2], 10) - 1
        if (row >= at) newCells[m[1] + (row + 2)] = state.cells[key]
        else newCells[key] = state.cells[key]
      }
      for (const key of Object.keys(state.cellFormats)) {
        const m = key.match(/^([A-Z]+)(\d+)$/)
        if (!m) continue
        const row = parseInt(m[2], 10) - 1
        if (row >= at) newFormats[m[1] + (row + 2)] = state.cellFormats[key]
        else newFormats[key] = state.cellFormats[key]
      }
      state.cells = newCells
      state.cellFormats = newFormats
      state.rows += 1
      state.dirty = true
    },
    deleteRow(state, action: PayloadAction<number>) {
      if (state.rows <= 1) return
      const at = action.payload
      const newCells: Cells = {}
      const newFormats: CellFormats = {}
      for (const key of Object.keys(state.cells)) {
        const m = key.match(/^([A-Z]+)(\d+)$/)
        if (!m) continue
        const row = parseInt(m[2], 10) - 1
        if (row === at) continue
        if (row > at) newCells[m[1] + row] = state.cells[key]
        else newCells[key] = state.cells[key]
      }
      for (const key of Object.keys(state.cellFormats)) {
        const m = key.match(/^([A-Z]+)(\d+)$/)
        if (!m) continue
        const row = parseInt(m[2], 10) - 1
        if (row === at) continue
        if (row > at) newFormats[m[1] + row] = state.cellFormats[key]
        else newFormats[key] = state.cellFormats[key]
      }
      state.cells = newCells
      state.cellFormats = newFormats
      state.rows -= 1
      state.dirty = true
    },
    insertCol(state, action: PayloadAction<number>) {
      const at = action.payload
      const newCells: Cells = {}
      const newFormats: CellFormats = {}
      for (const key of Object.keys(state.cells)) {
        const m = key.match(/^([A-Z]+)(\d+)$/)
        if (!m) continue
        const col = letterToCol(m[1])
        if (col >= at) newCells[colToLetter(col + 1) + m[2]] = state.cells[key]
        else newCells[key] = state.cells[key]
      }
      for (const key of Object.keys(state.cellFormats)) {
        const m = key.match(/^([A-Z]+)(\d+)$/)
        if (!m) continue
        const col = letterToCol(m[1])
        if (col >= at) newFormats[colToLetter(col + 1) + m[2]] = state.cellFormats[key]
        else newFormats[key] = state.cellFormats[key]
      }
      state.cells = newCells
      state.cellFormats = newFormats
      state.cols += 1
      state.dirty = true
    },
    deleteCol(state, action: PayloadAction<number>) {
      if (state.cols <= 1) return
      const at = action.payload
      const newCells: Cells = {}
      const newFormats: CellFormats = {}
      for (const key of Object.keys(state.cells)) {
        const m = key.match(/^([A-Z]+)(\d+)$/)
        if (!m) continue
        const col = letterToCol(m[1])
        if (col === at) continue
        if (col > at) newCells[colToLetter(col - 1) + m[2]] = state.cells[key]
        else newCells[key] = state.cells[key]
      }
      for (const key of Object.keys(state.cellFormats)) {
        const m = key.match(/^([A-Z]+)(\d+)$/)
        if (!m) continue
        const col = letterToCol(m[1])
        if (col === at) continue
        if (col > at) newFormats[colToLetter(col - 1) + m[2]] = state.cellFormats[key]
        else newFormats[key] = state.cellFormats[key]
      }
      state.cells = newCells
      state.cellFormats = newFormats
      state.cols -= 1
      state.dirty = true
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
    selectAll(state) {
      state.selRow = 0
      state.selCol = 0
      state.selEndRow = state.rows - 1
      state.selEndCol = state.cols - 1
    },
    moveSelection(state, action: PayloadAction<{ dRow: number; dCol: number }>) {
      const { dRow, dCol } = action.payload
      const r = Math.max(0, Math.min(state.rows - 1, state.selRow + dRow))
      const c = Math.max(0, Math.min(state.cols - 1, state.selCol + dCol))
      state.selRow = r
      state.selCol = c
      state.selEndRow = r
      state.selEndCol = c
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
      if (item.type === 'cell') {
        const cur = state.cells[item.key] || ''
        state.redoStack.push({ type: 'cell', key: item.key, value: cur })
        if (item.value === '') delete state.cells[item.key]
        else state.cells[item.key] = item.value
      } else {
        const cur = state.cellFormats[item.key]
        state.redoStack.push({ type: 'format', key: item.key, format: cur ? { ...cur } : undefined })
        if (!item.format) delete state.cellFormats[item.key]
        else state.cellFormats[item.key] = item.format
      }
      state.dirty = true
    },
    redo(state) {
      const item = state.redoStack.pop()
      if (!item) return
      if (item.type === 'cell') {
        const cur = state.cells[item.key] || ''
        state.undoStack.push({ type: 'cell', key: item.key, value: cur })
        if (item.value === '') delete state.cells[item.key]
        else state.cells[item.key] = item.value
      } else {
        const cur = state.cellFormats[item.key]
        state.undoStack.push({ type: 'format', key: item.key, format: cur ? { ...cur } : undefined })
        if (!item.format) delete state.cellFormats[item.key]
        else state.cellFormats[item.key] = item.format
      }
      state.dirty = true
    },
    importCells(state, action: PayloadAction<{ cells: Cells; rows: number; cols: number }>) {
      state.cells = { ...action.payload.cells }
      state.rows = Math.max(action.payload.rows, state.rows)
      state.cols = Math.max(action.payload.cols, state.cols)
      state.undoStack = []
      state.redoStack = []
      state.dirty = true
    },
    setClipboard(state, action: PayloadAction<ClipboardCell[]>) {
      state.clipboard = action.payload
    },
    pasteClipboard(state, action: PayloadAction<{ row: number; col: number }>) {
      if (!state.clipboard || state.clipboard.length === 0) return
      const minR = Math.min(...state.clipboard.map(c => c.row))
      const minC = Math.min(...state.clipboard.map(c => c.col))
      const dr = action.payload.row - minR
      const dc = action.payload.col - minC
      for (const c of state.clipboard) {
        const r = c.row + dr
        const cc = c.col + dc
        if (r < 0 || cc < 0 || r >= state.rows || cc >= state.cols) continue
        const key = cellKey(r, cc)
        const oldVal = state.cells[key] || ''
        const oldFmt = state.cellFormats[key]
        pushUndo(state, { type: 'cell', key, value: oldVal })
        pushUndo(state, { type: 'format', key, format: oldFmt ? { ...oldFmt } : undefined })
        if (c.value === '') delete state.cells[key]
        else state.cells[key] = c.value
        if (c.format) state.cellFormats[key] = { ...c.format }
        else delete state.cellFormats[key]
      }
      state.dirty = true
    },
    markSaved(state) {
      state.dirty = false
    },
  },
})

export const {
  loadDoc,
  reset,
  setCell,
  setCellFormat,
  clearCells,
  setColWidth,
  setRowHeight,
  insertRow,
  deleteRow,
  insertCol,
  deleteCol,
  setSelection,
  selectAll,
  moveSelection,
  startEditing,
  setEditValue,
  stopEditing,
  undo,
  redo,
  importCells,
  setClipboard,
  pasteClipboard,
  markSaved,
} = slice.actions

export default slice.reducer

export const SPREADSHEET_MUTATION_TYPES = [
  setCell.type,
  setCellFormat.type,
  clearCells.type,
  setColWidth.type,
  setRowHeight.type,
  insertRow.type,
  deleteRow.type,
  insertCol.type,
  deleteCol.type,
  undo.type,
  redo.type,
  importCells.type,
  pasteClipboard.type,
]
