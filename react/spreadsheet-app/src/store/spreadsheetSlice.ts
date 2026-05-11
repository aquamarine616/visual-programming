import { createSlice } from '@reduxjs/toolkit'
import { cellKey, letterToCol, colToLetter } from '../utils/cellRef'

const initialState = {
  cells: {} as any,
  rows: 0,
  cols: 0,
  colWidths: {} as any,
  rowHeights: {} as any,
  selRow: 0,
  selCol: 0,
  selEndRow: 0,
  selEndCol: 0,
  editing: false,
  editValue: '',
  undoStack: [] as any[],
  redoStack: [] as any[]
}

const slice = createSlice({
  name: 'spreadsheet',
  initialState: initialState,
  reducers: {
    loadDoc(state, action: any) {
      state.cells = action.payload.cells
      state.rows = action.payload.rows
      state.cols = action.payload.cols
      state.colWidths = action.payload.colWidths
      state.rowHeights = action.payload.rowHeights
      state.undoStack = []
      state.redoStack = []
    },

    reset() {
      return initialState
    },

    setCell(state, action: any) {
      let r = action.payload.row
      let c = action.payload.col
      let val = action.payload.value
      let key = cellKey(r, c)
      
      let oldVal = state.cells[key] || ''
      state.undoStack.push({ key: key, value: oldVal })
      state.redoStack = []

      state.cells[key] = val
    },

    insertRow(state, action: any) {
      let index = action.payload
      let newCells: any = {}
      
      Object.keys(state.cells).forEach(key => {
        let match = key.match(/^([A-Z]+)(\d+)$/)
        if (match) {
          let r = parseInt(match[2]) - 1
          let colStr = match[1]
          if (r >= index) {
            newCells[colStr + (r + 2)] = state.cells[key]
          } else {
            newCells[key] = state.cells[key]
          }
        }
      })
      state.cells = newCells
      state.rows = state.rows + 1
    },

    deleteRow(state, action: any) {
      if (state.rows <= 1) return
      let index = action.payload
      let newCells: any = {}
      
      Object.keys(state.cells).forEach(key => {
        let match = key.match(/^([A-Z]+)(\d+)$/)
        if (match) {
          let r = parseInt(match[2]) - 1
          let colStr = match[1]
          if (r === index) return
          if (r > index) {
            newCells[colStr + r] = state.cells[key]
          } else {
            newCells[key] = state.cells[key]
          }
        }
      })
      state.cells = newCells
      state.rows -= 1
    },

    insertCol(state, action: any) {
      let index = action.payload
      let newCells: any = {}
      
      Object.keys(state.cells).forEach(key => {
        let match = key.match(/^([A-Z]+)(\d+)$/)
        if (match) {
          let col = letterToCol(match[1])
          if (col >= index) {
            newCells[colToLetter(col + 1) + match[2]] = state.cells[key]
          } else {
            newCells[key] = state.cells[key]
          }
        }
      })
      state.cells = newCells
      state.cols += 1
    },

    deleteCol(state, action: any) {
      if (state.cols <= 1) return
      let index = action.payload
      let newCells: any = {}
      
      Object.keys(state.cells).forEach(key => {
        let match = key.match(/^([A-Z]+)(\d+)$/)
        if (match) {
          let col = letterToCol(match[1])
          if (col === index) return
          if (col > index) {
            newCells[colToLetter(col - 1) + match[2]] = state.cells[key]
          } else {
            newCells[key] = state.cells[key]
          }
        }
      })
      state.cells = newCells
      state.cols -= 1
    },

    setSelection(state, action: any) {
      if (action.payload.extend) {
        state.selEndRow = action.payload.row
        state.selEndCol = action.payload.col
      } else {
        state.selRow = action.payload.row
        state.selCol = action.payload.col
        state.selEndRow = action.payload.row
        state.selEndCol = action.payload.col
      }
    },

    startEditing(state, action: any) {
      state.editing = true
      state.editValue = action.payload
    },

    stopEditing(state) {
      state.editing = false
    },

    setEditValue(state, action: any) {
      state.editValue = action.payload
    },

    undo(state) {
      let last = state.undoStack.pop()
      if (last) {
        let current = state.cells[last.key] || ''
        state.redoStack.push({ key: last.key, value: current })
        if (last.value === '') {
          delete state.cells[last.key]
        } else {
          state.cells[last.key] = last.value
        }
      }
    },

    redo(state) {
      let item = state.redoStack.pop()
      if (item) {
        let current = state.cells[item.key] || ''
        state.undoStack.push({ key: item.key, value: current })
        if (item.value === '') {
          delete state.cells[item.key]
        } else {
          state.cells[item.key] = item.value
        }
      }
    },

    setColWidth(state, action: any) {
      state.colWidths[action.payload.col] = action.payload.width
    },
    
    setRowHeight(state, action: any) {
      state.rowHeights[action.payload.row] = action.payload.height
    },

    importCells(state, action: any) {
      state.cells = action.payload.cells
      
      if (action.payload.rows > state.rows) state.rows = action.payload.rows
      if (action.payload.cols > state.cols) state.cols = action.payload.cols
      
      state.undoStack = []
      state.redoStack = []
    }
  }
})

export const { 
  loadDoc, setCell, setSelection, startEditing, 
  stopEditing, setEditValue, undo, redo, insertRow, deleteRow, insertCol, deleteCol,
  setColWidth, setRowHeight, reset, importCells
} = slice.actions

export default slice.reducer

export const SPREADSHEET_MUTATION_TYPES = [
  'spreadsheet/setCell',
  'spreadsheet/setColWidth',
  'spreadsheet/setRowHeight',
  'spreadsheet/insertRow',
  'spreadsheet/deleteRow',
  'spreadsheet/insertCol',
  'spreadsheet/deleteCol',
  'spreadsheet/undo',
  'spreadsheet/redo',
  'spreadsheet/importCells'
]